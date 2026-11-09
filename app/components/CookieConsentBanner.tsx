"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCookieConsent } from "../context/CookieConsentContext";
import { useLanguage } from "../context/LanguageContext";

export default function CookieConsentBanner() {
  const { showBanner, consent, acknowledge, openSettings, closeBanner } = useCookieConsent();
  const { L, lang } = useLanguage();

  // The homepage footer opens the notice through this event.
  useEffect(() => {
    const handleOpen = () => openSettings();
    window.addEventListener("open-cookie-settings", handleOpen);
    return () => window.removeEventListener("open-cookie-settings", handleOpen);
  }, [openSettings]);

  // Escape closes the dialog once a choice has been saved.
  useEffect(() => {
    if (!showBanner || !consent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBanner();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showBanner, consent, closeBanner]);

  if (!showBanner) return null;

  return (
    <motion.div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-text"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-6 md:right-6 md:max-w-xl mx-auto"
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 relative">
        {consent && (
          <button
            type="button"
            onClick={closeBanner}
            aria-label={L("Schließen", "Close")}
            className="absolute top-4 right-5 text-2xl text-gray-400 hover:text-black"
          >
            ×
          </button>
        )}
        <div className="p-6 md:p-8">
          <h2 id="cookie-consent-title" className="font-serif text-xl md:text-2xl text-[#2d2d2d] mb-3 pr-8">
            {L("Cookie-Einstellungen", "Cookie settings")}
          </h2>

          <p id="cookie-consent-text" className="text-sm text-[#6b6b6b] leading-relaxed mb-5">
            {L(
              "Wir verwenden keine Tracking-, Analyse- oder Werbe-Cookies. Gespeichert wird nur Ihre Auswahl, damit dieser Hinweis nicht bei jedem Besuch erneut erscheint.",
              "We do not use tracking, analytics or advertising cookies. We only store your choice so that this notice does not appear on every visit."
            )}
          </p>

          <label className="flex items-start gap-3 mb-6">
            <input type="checkbox" checked disabled className="mt-1 w-4 h-4 accent-[#cda1b1]" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                {L("Notwendig (immer aktiv)", "Necessary (always active)")}
              </span>
              <span className="block text-xs text-[#6b6b6b]">
                {L(
                  "Speichert Ihre Auswahl im Browser (Local Storage) und als anonymen Nachweis (zufällige ID, Version, Zeitpunkt) in unserer Datenbank. Keine Weitergabe an Dritte.",
                  "Stores your choice in your browser (local storage) and as anonymous proof (random ID, version, time) in our database. Not shared with third parties."
                )}
              </span>
            </span>
          </label>

          {consent && (
            <p className="text-xs text-[#6b6b6b] mb-4" role="status">
              {L("Gespeichert am", "Saved on")} {new Date(consent.savedAt).toLocaleString(lang === "en" ? "en-GB" : "de-DE")} · ID{" "}
              <span className="font-mono">{consent.consentId.slice(0, 8)}</span>
            </p>
          )}

          <button
            onClick={acknowledge}
            className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-[10px] bg-[#353941] text-white hover:bg-[#2a2d33] transition-colors"
          >
            {consent ? L("Auswahl erneut speichern", "Save choice again") : L("Verstanden", "Got it")}
          </button>

          <p className="text-center text-xs text-[#6b6b6b] mt-4">
            {L("Mehr dazu in unserer", "More in our")}{" "}
            <Link href="/datenschutz" className="text-[#b5788f] underline underline-offset-2">
              {L("Datenschutzerklärung", "privacy policy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
}
