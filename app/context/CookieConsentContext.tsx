"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, ReactNode } from "react";

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

type CookieConsentContextType = {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  savePreferences: (preferences: Partial<CookieConsent>) => void;
  openBanner: () => void;
  openSettings: () => void;
  closeBanner: () => void;
  resetConsent: () => void;
};

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = "cookie-consent";
const listeners = new Set<() => void>();

const readStoredConsent = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStoredConsent = (value: CookieConsent | null) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode / blocked) — consent lasts for this page view only.
  }
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const parseConsent = (raw: string | null | undefined): CookieConsent | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // undefined on the server / before hydration, so nothing consent-related renders until mounted.
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readStoredConsent, () => undefined);
  const [sessionConsent, setSessionConsent] = useState<CookieConsent | null>(null);
  const consent = useMemo(() => parseConsent(raw) ?? sessionConsent, [raw, sessionConsent]);
  const mounted = raw !== undefined;

  // null = default behaviour (show the banner until the visitor has decided).
  const [bannerVisible, setBannerVisible] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const saveConsent = (newConsent: CookieConsent) => {
    setSessionConsent(newConsent);
    writeStoredConsent(newConsent);
    setBannerVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () =>
    saveConsent({ necessary: true, analytics: true, marketing: true, functional: true });

  const acceptNecessaryOnly = () => saveConsent({ ...defaultConsent });

  const savePreferences = (preferences: Partial<CookieConsent>) =>
    saveConsent({ ...defaultConsent, ...consent, ...preferences, necessary: true });

  const openBanner = () => setBannerVisible(true);
  const openSettings = () => {
    setBannerVisible(true);
    setShowSettings(true);
  };
  const closeBanner = () => {
    setBannerVisible(false);
    setShowSettings(false);
  };

  const resetConsent = () => {
    setSessionConsent(null);
    writeStoredConsent(null);
    setBannerVisible(true);
    setShowSettings(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent: mounted ? consent : null,
        hasConsented: mounted && consent !== null,
        showBanner: mounted && (bannerVisible ?? consent === null),
        showSettings: mounted && showSettings,
        acceptAll,
        acceptNecessaryOnly,
        savePreferences,
        openBanner,
        openSettings,
        closeBanner,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    // Return default values for SSR/static generation
    return {
      consent: null,
      hasConsented: false,
      showBanner: false,
      showSettings: false,
      acceptAll: () => {},
      acceptNecessaryOnly: () => {},
      savePreferences: () => {},
      openBanner: () => {},
      openSettings: () => {},
      closeBanner: () => {},
      resetConsent: () => {},
    };
  }
  return context;
}