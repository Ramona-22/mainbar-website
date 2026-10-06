import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { checkRateLimit } from "../../../lib/rateLimit";
import { getClientIp } from "../../../lib/clientIp";

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, type } = body as { email?: string; type?: "booking" | "review" | "all" };

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type (booking, review, or all) are required" },
        { status: 400 }
      );
    }

    const deletedCounts: Record<string, number> = {};

    if (type === "booking" || type === "all") {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("email", "==", email));
      const snapshot = await getDocs(q);
      
      await Promise.all(
        snapshot.docs.map((doc) => deleteDoc(doc.ref))
      );
      deletedCounts.bookings = snapshot.size;
    }

    if (type === "review" || type === "all") {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("author", "==", email));
      const snapshot = await getDocs(q);
      
      await Promise.all(
        snapshot.docs.map((doc) => deleteDoc(doc.ref))
      );
      deletedCounts.reviews = snapshot.size;
    }

    // Send confirmation email
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const typeLabels: Record<string, string> = {
      booking: "Event-Anfrage(n)",
      review: "Bewertung(en)",
      all: "alle Ihre Daten (Event-Anfragen und Bewertungen)",
    };

    await transporter.sendMail({
      from: `"MainBar Datenschutz" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Bestätigung: Löschung Ihrer Daten",
      html: `
        <div style="font-family: sans-serif; color: #353941; padding: 20px;">
          <h2>Ihre Daten wurden gelöscht</h2>
          <p>Gemäß Art. 17 DSGVO (Recht auf Löschung) haben wir folgende Daten entfernt:</p>
          <ul>
            ${Object.entries(deletedCounts).map(([key, count]) => 
              `<li><strong>${key}:</strong> ${count} Eintrag${count !== 1 ? "e" : ""} gelöscht</li>`
            ).join("")}
          </ul>
          <p>Falls Sie weitere Fragen haben, kontaktieren Sie uns gerne unter info@mainbar-sw.de.</p>
          <p><i>Ihr MainBar Team</i></p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      deleted: deletedCounts,
      message: `Erfolgreich gelöscht: ${typeLabels[type]}`
    });
  } catch (error) {
    console.error("GDPR delete error:", error);
    return NextResponse.json({ error: "Failed to process deletion request" }, { status: 500 });
  }
}