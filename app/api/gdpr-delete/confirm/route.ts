import { NextResponse } from "next/server";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { getClientIp } from "../../../../lib/clientIp";
import { verifyDeletionToken } from "../../../../lib/gdprToken";
import { findBookingsByEmail, getGdprConfig, UNAVAILABLE_MESSAGE } from "../shared";

// Step 2: deletes the bookings for the email inside a valid, unexpired signed token.
export async function POST(request: Request) {
  try {
    const rateLimitResult = await checkRateLimit(getClientIp(request), "gdpr-delete");
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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

    const email = verifyDeletionToken((body as { token?: unknown })?.token, config.secret);
    if (!email) {
      return NextResponse.json(
        { error: "Der Link ist ungültig oder abgelaufen. Bitte stellen Sie die Anfrage erneut." },
        { status: 400 }
      );
    }

    const snapshot = await findBookingsByEmail(config.db, email);
    const batch = config.db.batch();
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return NextResponse.json({ success: true, deleted: snapshot.size });
  } catch (error) {
    console.error("GDPR delete confirm error:", error);
    return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
  }
}
