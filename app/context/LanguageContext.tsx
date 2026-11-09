"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/*
  Two languages: German (primary, always the server-rendered default) and English.
  The visitor's choice is kept in localStorage ("mb-lang"); without a stored choice,
  or with storage blocked, the site is German.
*/
export type Lang = "de" | "en";

// Page titles per language; German must match the pages' metadata.
const TITLES: Record<string, Record<Lang, string>> = {
  "/": {
    de: "MainBar – Café & Bar in Schweinfurt | Frühstück, Wein & Events",
    en: "MainBar – Café & Bistro in Schweinfurt | Breakfast, Wine & Events",
  },
  "/booking": {
    de: "Event & Catering anfragen | MainBar Schweinfurt",
    en: "Events & catering enquiry | MainBar Schweinfurt",
  },
  "/impressum": { de: "Impressum | MainBar", en: "Legal notice | MainBar" },
  "/datenschutz": { de: "Datenschutzerklärung | MainBar", en: "Privacy policy | MainBar" },
};

const KEY = "mb-lang";
const EVENT = "mb-lang-change";

const read = (): Lang => {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "de";
  } catch {
    return "de";
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Picks the text for the current language: L("Speisekarte", "Menu"). */
  L: <T>(de: T, en: T) => T;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "de",
  setLang: () => {},
  L: (de) => de,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, read, () => "de" as Lang);

  const setLang = useCallback((next: Lang) => {
    try {
      if (next === "de") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page is left
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  // Screen readers, hyphenation and browser translation follow the page language.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The browser tab title follows the language too (the server always sends German).
  const pathname = usePathname();
  useEffect(() => {
    const titles = TITLES[pathname];
    if (titles) document.title = titles[lang];
  }, [lang, pathname]);

  const value = useMemo<LanguageContextType>(
    () => ({ lang, setLang, L: (de, en) => (lang === "en" ? en : de) }),
    [lang, setLang]
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

/** Renders one of two prepared versions, e.g. a whole legal text. */
export function ByLang({ de, en }: { de: React.ReactNode; en: React.ReactNode }) {
  const { lang } = useLanguage();
  return <>{lang === "en" ? en : de}</>;
}
