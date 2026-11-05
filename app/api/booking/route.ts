import { NextResponse } from "next/server";
import { validateBooking, escapeHtml } from "../../../lib/bookingValidation";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp } from "../../../lib/clientIp";
import { getMailer } from "../../../lib/mailer";
import { isJsonRequest } from "../../../lib/clientIp";

// The customer confirmation goes to an address the visitor typed in, so it
// must not repeat any free text they entered (city, state, phone): otherwise
// the form could be used to send phishing text from MainBar's Gmail account.
const SEATING_LABELS: Record<string, string> = {
  inside: "Innenbereich",
  outside: "Außenbereich",
  catering: "Catering",
};

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
    const safeDate = escapeHtml(date);
    const safeSeating = escapeHtml(seating);
    const safeState = escapeHtml(state);
    const safeCity = escapeHtml(city);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);

    const { transporter, ownerAddress } = getMailer();

    // 1. Thank You Email to Customer
    const customerMailOptions = {
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
    };

    // 2. Alert Email to Owner
    const ownerMailOptions = {
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
    };

    // Send both emails simultaneously
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(ownerMailOptions),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}