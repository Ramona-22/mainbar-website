import { NextResponse } from "next/server";
import { validateBooking, escapeHtml } from "../../../lib/bookingValidation";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp } from "../../../lib/clientIp";
import { getMailer } from "../../../lib/mailer";
import { isJsonRequest } from "../../../lib/clientIp";
import { getAdminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// The customer confirmation goes to an address the visitor typed in, so it
// must not repeat any free text they entered (city, state, phone): otherwise
// the form could be used to send phishing text from MainBar's Gmail account.
const SEATING_LABELS: Record<string, string> = {
  inside: "Innenbereich",
  outside: "Außenbereich",
  catering: "Catering",
};

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

    const safeDate = escapeHtml(date);
    const safeSeating = escapeHtml(seating);
    const safeState = escapeHtml(state);
    const safeCity = escapeHtml(city);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);

    // 1. Thank You Email to Customer
    const customerMailOptions = (ownerAddress: string) => ({
      from: `"MainBar Schweinfurt" <${ownerAddress}>`,
      to: email,
      subject: "Ihre Anfrage bei MainBar Event & Catering",
      html: `
        <div style="font-family: sans-serif; color: #353941; padding: 20px;">
          <h2>Vielen Dank für Ihre Anfrage!</h2>
          <p>Wir haben Ihre Event-Anfrage für den <b>${safeDate}</b> (${guests} Personen) erhalten.</p>
          <p><b>Bereich:</b> ${SEATING_LABELS[seating]}</p>
          <br/>
          <p>Unser Team prüft aktuell die Verfügbarkeit und meldet sich in Kürze bei Ihnen.</p>
          <p><i>Ihr MainBar Team</i></p>
        </div>
      `,
    });

    // 2. Alert Email to Owner
    const ownerMailOptions = (ownerAddress: string) => ({
      from: `"MainBar Website" <${ownerAddress}>`,
      to: ownerAddress,
      subject: `Neue Event-Anfrage: ${safeDate} (${guests} Personen)`,
      html: `
        <div style="font-family: sans-serif; color: #353941; padding: 20px;">
          <h2>Neue Catering / Event Anfrage</h2>
          <p><b>Datum:</b> ${safeDate}</p>
          <p><b>Gäste:</b> ${guests}</p>
          <p><b>Sitzplatz:</b> ${safeSeating}</p>
          <p><b>Ort:</b> ${safeCity}, ${safeState}</p>
          <p><b>Telefon:</b> ${safePhone}</p>
          <p><b>Email:</b> ${safeEmail}</p>
        </div>
      `,
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