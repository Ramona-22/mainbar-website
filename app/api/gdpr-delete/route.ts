import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp } from "../../../lib/clientIp";
import { EMAIL_PATTERN } from "../../../lib/bookingValidation";
import { createDeletionToken } from "../../../lib/gdprToken";
import { findBookingsByEmail, getGdprConfig, UNAVAILABLE_MESSAGE } from "./shared";

// Step 1 of a deletion request: nothing is deleted here. If bookings exist for the
// address, a signed confirmation link is mailed to it; only the mailbox owner can
// complete the deletion via /daten-loeschen → /api/gdpr-delete/confirm.
// The response is identical either way so the endpoint can't be used to probe
// which addresses have bookings.
const GENERIC_MESSAGE =
  "Falls zu dieser E-Mail-Adresse Daten bei uns gespeichert sind, haben wir Ihnen einen Bestätigungslink gesendet. Bitte prüfen Sie Ihr Postfach.";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimit(clientIp, "gdpr-delete");
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

    const config = getGdprConfig();
    if (!config) {
      return NextResponse.json({ error: UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const rawEmail = (body as { email?: unknown })?.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }

    const bookings = await findBookingsByEmail(config.db, email);
    if (bookings.empty) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const link = `${origin}/daten-loeschen?token=${encodeURIComponent(createDeletionToken(email, config.secret))}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"MainBar Datenschutz" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Bitte bestätigen: Löschung Ihrer Daten",
      html: `
        <div style="font-family: sans-serif; color: #353941; padding: 20px;">
          <h2>Löschung Ihrer Daten bestätigen</h2>
          <p>Wir haben eine Anfrage erhalten, Ihre bei MainBar gespeicherten Event-Anfragen zu löschen (Art. 17 DSGVO).</p>
          <p><a href="${link}" style="display:inline-block;background:#353941;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;">Löschung bestätigen</a></p>
          <p>Der Link ist 24 Stunden gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren – es wird nichts gelöscht.</p>
          <p><i>Ihr MainBar Team</i></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("GDPR delete request error:", error);
    return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
  }
}
