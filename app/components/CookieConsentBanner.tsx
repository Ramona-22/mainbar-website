"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCookieConsent } from "../context/CookieConsentContext";

export default function CookieConsentBanner() {
  const { showBanner, acknowledge, openSettings } = useCookieConsent();

  // The homepage footer opens the notice through this event.
  useEffect(() => {
    const handleOpen = () => openSettings();
    window.addEventListener("open-cookie-settings", handleOpen);
    return () => window.removeEventListener("open-cookie-settings", handleOpen);
  }, [openSettings]);

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
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100">
        <div className="p-6 md:p-8">
          <h2 id="cookie-consent-title" className="font-serif text-xl md:text-2xl text-[#2d2d2d] mb-3">
            Cookie-Einstellungen
          </h2>

          <p id="cookie-consent-text" className="text-sm text-[#6b6b6b] leading-relaxed mb-5">
            Wir verwenden keine Tracking-, Analyse- oder Werbe-Cookies. Gespeichert wird nur, dass Sie
            diesen Hinweis gesehen haben, damit er nicht bei jedem Besuch erneut erscheint.
          </p>

          <label className="flex items-start gap-3 mb-6">
            <input type="checkbox" checked disabled className="mt-1 w-4 h-4 accent-[#cda1b1]" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                Notwendig (immer aktiv)
              </span>
              <span className="block text-xs text-[#6b6b6b]">
                Speichert diesen Hinweis-Status im Browser (Local Storage). Keine Weitergabe an Dritte.
              </span>
            </span>
          </label>

          <button
            onClick={acknowledge}
            className="w-full py-3 rounded-full font-bold uppercase tracking-widest text-[10px] bg-[#353941] text-white hover:bg-[#2a2d33] transition-colors"
          >
            Verstanden
          </button>

          <p className="text-center text-xs text-[#6b6b6b] mt-4">
            Mehr dazu in unserer{" "}
            <Link href="/datenschutz" className="text-[#b5788f] underline underline-offset-2">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
}
