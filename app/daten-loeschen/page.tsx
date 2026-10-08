"use client";

import Link from "next/link";
import { useState } from "react";

type Status = "idle" | "deleting" | "done" | "error";

export default function DatenLoeschenPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Deletion only happens on this explicit click — never on page load — so email
  // link scanners that pre-open URLs can't trigger it.
  const handleConfirm = async () => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Der Link ist unvollständig. Bitte öffnen Sie ihn direkt aus der E-Mail.");
      return;
    }

    setStatus("deleting");
    try {
      const res = await fetch("/api/gdpr-delete/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("done");
        setMessage(
          data.deleted > 0
            ? `Erledigt: ${data.deleted} Event-Anfrage${data.deleted === 1 ? "" : "n"} gelöscht.`
            : "Es sind keine Daten mehr zu dieser E-Mail-Adresse gespeichert."
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Die Löschung ist fehlgeschlagen.");
      }
    } catch {
      setStatus("error");
      setMessage("Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#767676] hover:text-[#cda1b1] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4">Daten löschen</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-10" />

        {status === "done" ? (
          <p className="text-[#2d2d2d] leading-relaxed" role="status">{message}</p>
        ) : (
          <>
            <p className="text-sm text-[#4a4a4a] leading-relaxed mb-8">
              Mit Klick auf die Schaltfläche werden alle Event- und Reservierungsanfragen, die unter
              Ihrer E-Mail-Adresse bei uns gespeichert sind, endgültig gelöscht (Art. 17 DSGVO).
              Für die Löschung einer Bewertung schreiben Sie uns bitte an{" "}
              <a href="mailto:info@mainbar-sw.de" className="text-[#cda1b1] underline">info@mainbar-sw.de</a>.
            </p>

            <button
              onClick={handleConfirm}
              disabled={status === "deleting"}
              className="bg-[#353941] text-white px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-xs hover:bg-[#2a2d33] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {status === "deleting" ? "Wird gelöscht..." : "Löschung bestätigen"}
            </button>

            {status === "error" && (
              <p className="mt-6 text-sm text-red-700" role="alert">{message}</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
