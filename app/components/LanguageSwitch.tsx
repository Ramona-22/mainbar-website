"use client";

import { usePathname } from "next/navigation";
import { useLanguage, type Lang } from "../context/LanguageContext";

// DE | EN switch in the top-right corner of every public page (the admin area is German only).
export default function LanguageSwitch() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  if (pathname.startsWith("/admin")) return null;

  const option = (value: Lang, label: string, name: string) => (
    <button
      type="button"
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      aria-label={name}
      lang={value}
      className={`px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-semibold tracking-[0.18em] transition-colors duration-300 ${
        lang === value ? "bg-[#cda1b1] text-[#1c1a1d]" : "text-white/80 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label={lang === "en" ? "Language" : "Sprache"}
      className="fixed top-6 right-6 md:top-8 md:right-8 z-60 flex items-center gap-0.5 rounded-full bg-[#1c1a1d]/75 p-1 ring-1 ring-white/10 backdrop-blur-md"
    >
      {option("de", "DE", "Deutsch")}
      {option("en", "EN", "English")}
    </div>
  );
}
