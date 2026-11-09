import { NextResponse } from "next/server";
import { validateBooking } from "../../../lib/bookingValidation";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp } from "../../../lib/clientIp";
import { getMailer } from "../../../lib/mailer";
import { isJsonRequest } from "../../../lib/clientIp";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { guestConfirmation, ownerAlert } from "../../../lib/emailTemplates";

// "not-configured": GMAIL_USER / GMAIL_APP_PASSWORD missing on the server.
// "login-rejected": Gmail refused the account or app password.
// "send-failed": anything else (network, Gmail limits).
function mailFailureReason(error: unknown) {
  const e = error as { message?: string; code?: string; responseCode?: number };
  if (e?.message?.includes("not configured")) return "not-configured";
  if (e?.code === "EAUTH" || e?.responseCode === 535) return "login-rejected";
  return "send-failed";
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: rateLimitResult.retryAfterSeconds
            ? { "Retry-After": String(rateLimitResult.retryAfterSeconds) }
            : undefined,
        }
      );
    }

    // Only accept real JSON requests: blocks cross-site HTML form posts
    // (text/plain) that would otherwise be parsed as JSON below.
    if (!isJsonRequest(request)) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = validateBooking(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { seating, guests, date, state, city, phone, email } = result.data;

    // Second limit per recipient address, so one inbox cannot be flooded
    // with confirmation emails even from many different IPs.
    const recipientLimit = await checkRateLimit(`email:${email.toLowerCase()}`);
    if (!recipientLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Store the booking on the server first (validated data only). Without a
    // service account the browser stores it instead (stored: false).
    const adminDb = getAdminDb();
    let stored = false;
    if (adminDb) {
      await adminDb.collection("bookings").add({
        seating,
        guests,
        date,
        state,
        city,
        phone,
        email,
        status: "Neu",
        createdAt: FieldValue.serverTimestamp(),
      });
      stored = true;
    }

    // Styled emails (lib/emailTemplates.ts). The guest copy repeats no free text.
    const mailData = { seating, guests, date, state, city, phone, email };
    // The visitor's site language (DE/EN) only picks the guest email's language.
    const lang = (body as { lang?: unknown }).lang === "en" ? "en" : "de";
    const guestMail = guestConfirmation(mailData, lang);
    const ownerMail = ownerAlert(mailData);

    const customerMailOptions = (ownerAddress: string) => ({
      from: `"MainBar Schweinfurt" <${ownerAddress}>`,
      to: email,
      ...guestMail,
    });

    // Reply-To is the guest, so "Antworten" in the owner's mail app writes to them.
    const ownerMailOptions = (ownerAddress: string) => ({
      from: `"MainBar Website" <${ownerAddress}>`,
      to: ownerAddress,
      replyTo: email,
      ...ownerMail,
    });

    // Send both emails simultaneously. If the booking is already stored, a mail
    // failure must not make the visitor submit it again: the owner sees it in /admin.
    // Missing mail credentials count as a mail failure too (getMailer throws).
    try {
      const { transporter, ownerAddress } = getMailer();
      await Promise.all([
        transporter.sendMail(customerMailOptions(ownerAddress)),
        transporter.sendMail(ownerMailOptions(ownerAddress)),
      ]);
    } catch (mailError) {
      if (!stored) {
        console.error("Booking email failed:", mailError);
        // A coarse reason (no secrets) so the owner can tell a missing setting
        // from a rejected Gmail login without access to the server logs.
        return NextResponse.json(
          { error: "Failed to process booking", mail: mailFailureReason(mailError) },
          { status: 500 }
        );
      }
      console.error("Booking stored, but email failed:", mailError);
      return NextResponse.json({ success: true, stored, emailSent: false });
    }

    return NextResponse.json({ success: true, stored, emailSent: true });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to process booking" }, { status: 500 });
  }
}