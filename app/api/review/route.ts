import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp, isJsonRequest } from "../../../lib/clientIp";
import { validateReview } from "../../../lib/reviewValidation";
import { getAdminDb } from "../../../lib/firebaseAdmin";

// Guest review submission. Stored with approved: false; it only becomes
// public after the owner approves it in /admin. Without a service account
// the route returns stored: false and the browser stores the review itself
// (still checked by firestore.rules).
export async function POST(request: Request) {
  try {
    const rateLimitResult = await checkRateLimit(getClientIp(request), "review");
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

    const result = validateReview(body);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ success: true, stored: false });
    }

    await adminDb.collection("reviews").add({
      ...result.data,
      approved: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
