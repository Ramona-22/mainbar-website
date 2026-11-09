"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "../context/CookieConsentContext";
import { useLanguage } from "../context/LanguageContext";

// Impressum and Datenschutz must be reachable from every page (§ 5 DDG), and
// cookie consent must be as easy to withdraw as to give. The homepage has its
// own footer with these links, and the admin area is internal.
export default function LegalFooter() {
  const pathname = usePathname();
  const { openSettings } = useCookieConsent();
  const { L } = useLanguage();

  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const linkClass =
    "text-[10px] md:text-xs uppercase tracking-[0.12em] md:tracking-widest text-[#6b6b6b] hover:text-[#b5788f] transition-colors";

  return (
    <footer className="w-full bg-[#faf8f5] border-t border-gray-200/70 px-6 py-5">
      <nav
        aria-label={L("Rechtliches", "Legal")}
        className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6"
      >
        <Link href="/impressum" className={linkClass}>{L("Impressum", "Legal notice")}</Link>
        <Link href="/datenschutz" className={linkClass}>{L("Datenschutz", "Privacy")}</Link>
        <button type="button" onClick={openSettings} className={`${linkClass} cursor-pointer`}>
          {L("Cookie-Einstellungen", "Cookie settings")}
        </button>
      </nav>
    </footer>
  );
}
