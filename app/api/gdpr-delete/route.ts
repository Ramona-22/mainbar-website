import { NextResponse } from "next/server";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp, isJsonRequest } from "../../../lib/clientIp";
import { escapeHtml, isValidEmail } from "../../../lib/bookingValidation";
import { getMailer } from "../../../lib/mailer";

// GDPR erasure request (Art. 17 DSGVO).
//
// This route does NOT delete anything by itself: anyone can type any email
// address, so deleting immediately would let a stranger wipe another person's
// bookings. Instead it forwards the request to the owner, who checks it,
// deletes the entries in /admin and confirms to the requester (Art. 12:
// within one month).
export async function POST(request: Request) {
  try {
    const rateLimitResult = await checkRateLimit(getClientIp(request), "gdpr-delete");
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

    if (!isJsonRequest(request)) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = (body as { email?: unknown } | null)?.email;
    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
        { status: 400 }
      );
    }
    const safeEmail = escapeHtml(email.trim());

    const { transporter, ownerAddress } = getMailer();
    await transporter.sendMail({
      from: `"MainBar Website" <${ownerAddress}>`,
      to: ownerAddress,
      subject: "Löschantrag (DSGVO Art. 17)",
      html: `
        <div style="font-family: sans-serif; color: #353941; padding: 20px;">
          <h2>Neuer Löschantrag</h2>
          <p>Über die Website wurde die Löschung aller Daten zu folgender E-Mail-Adresse beantragt:</p>
          <p><b>${safeEmail}</b></p>
          <p>Bitte im Admin-Bereich die zugehörigen Event-Anfragen und Bewertungen löschen und der Person
          die Löschung per E-Mail bestätigen (spätestens innerhalb eines Monats).</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message:
        "Ihr Löschantrag ist eingegangen. Wir löschen Ihre Daten und bestätigen dies per E-Mail an die angegebene Adresse.",
    });
  } catch (error) {
    console.error("GDPR delete request error:", error);
    return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
  }
}
