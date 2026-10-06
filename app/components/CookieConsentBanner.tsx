"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent } from "../context/CookieConsentContext";
import Link from "next/link";

export default function CookieConsentBanner() {
  const { consent, showBanner, showSettings: contextShowSettings, acceptAll, acceptNecessaryOnly, savePreferences, closeBanner, openBanner, openSettings } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(contextShowSettings);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  });

  // Sync with context showSettings
  useEffect(() => {
    setShowSettings(contextShowSettings);
  }, [contextShowSettings]);

  // Listen for custom event to open cookie settings from footer link
  useEffect(() => {
    const handleOpenSettings = () => {
      openSettings();
      // Sync preferences with current consent
      if (consent) {
        setPreferences({
          analytics: consent.analytics,
          marketing: consent.marketing,
          functional: consent.functional,
        });
      }
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, [consent, openSettings]);

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
  };

  // Render if banner should show OR if settings panel should show (for footer link)
  if (!showBanner && !showSettings) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-6 md:right-6 md:max-w-xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {!showSettings ? (
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl text-[#2d2d2d] mb-2">
                    Wir schätzen Ihre Privatsphäre
                  </h3>
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">
                    Wir verwenden Cookies und ähnliche Technologien, um Ihre Erfahrung zu verbessern,
                    Inhalte zu personalisieren und den Traffic zu analysieren. Einige sind essenziell,
                    andere helfen uns, die Website zu optimieren.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Essenzielle Cookies (erforderlich)
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Notwendig für die grundlegende Funktion der Website (z. B. Spracheinstellungen, Sitzung).
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Funktionale Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Ermöglichen erweiterte Funktionen (z. B. Google Maps Kartenansicht, eingebettete Videos).
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Analytics Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Helfen uns zu verstehen, wie Besucher die Website nutzen (Firebase Analytics).
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Marketing Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Werden verwendet, um relevante Werbung anzuzeigen (aktuell nicht im Einsatz).
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleSavePreferences(); closeBanner(); }}
                  className="flex-1 bg-[#cda1b1] text-[#353941] py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors hover:bg-[#ebd2db]"
                >
                  Auswahl speichern
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptAll}
                  className="flex-1 bg-[#353941] text-white py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors hover:bg-[#2a2d33]"
                >
                  Alle akzeptieren
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={acceptNecessaryOnly}
                  className="flex-1 border border-gray-300 text-[#a0a0a0] py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors hover:border-[#cda1b1] hover:text-[#cda1b1]"
                >
                  Nur essenzielle
                </motion.button>
              </div>

              <p className="text-center text-xs text-[#a0a0a0] mt-4">
                Sie können Ihre Einstellungen jederzeit über den Link „Cookie-Einstellungen“ im Footer ändern.
                <Link href="/datenschutz" className="text-[#cda1b1] hover:underline ml-1">
                  Datenschutzerklärung
                </Link>
              </p>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl md:text-2xl text-[#2d2d2d]">Cookie-Einstellungen</h3>
                <button
                  onClick={closeBanner}
                  className="text-gray-400 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Essenzielle Cookies (erforderlich)
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Notwendig für die grundlegende Funktion der Website.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Funktionale Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Google Maps, eingebettete Videos, Schriftarten.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Analytics Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Firebase Analytics für Nutzungsstatistiken.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#cda1b1] mb-1">
                      Marketing Cookies
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      Aktuell nicht im Einsatz.
                    </p>
                  </div>
                </label>
              </div>
<motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleSavePreferences(); closeBanner(); }}
                  className="w-full bg-[#cda1b1] text-[#353941] py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors hover:bg-[#ebd2db]"
                >
                  Einstellungen speichern
                </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}