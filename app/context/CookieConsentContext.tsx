"use client";

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from "react";

// The site sets no tracking, analytics or marketing cookies and embeds no
// third-party content that needs consent. The only thing stored is that the
// visitor has seen the privacy notice (localStorage), so it is not shown again.

type CookieConsentContextType = {
  showBanner: boolean;
  acknowledge: () => void;
  openSettings: () => void;
  closeBanner: () => void;
};

const STORAGE_KEY = "cookie-consent";
// Bump when the notice changes, so visitors see it again.
const CONSENT_VERSION = 3;
// Show the notice again after 12 months (as stated in the Datenschutzerklärung).
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const listeners = new Set<() => void>();

const readStored = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStored = (value: object) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode / blocked): the notice is hidden for this page view only.
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

// Old, expired or malformed entries count as "not seen yet".
const isAcknowledged = (raw: string | null | undefined): boolean => {
  if (!raw) return false;
  try {
    const stored = JSON.parse(raw) as { version?: number; savedAt?: number };
    return (
      stored.version === CONSENT_VERSION &&
      typeof stored.savedAt === "number" &&
      Date.now() - stored.savedAt <= MAX_AGE_MS
    );
  } catch {
    return false;
  }
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // undefined on the server / before hydration, so the notice only renders once mounted.
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readStored, () => undefined);
  const [acknowledgedThisVisit, setAcknowledgedThisVisit] = useState(false);
  // null = default (show until acknowledged); true/false = opened/closed by the visitor.
  const [bannerVisible, setBannerVisible] = useState<boolean | null>(null);

  const mounted = raw !== undefined;
  const acknowledged = acknowledgedThisVisit || isAcknowledged(raw);

  const acknowledge = () => {
    setAcknowledgedThisVisit(true);
    writeStored({ necessary: true, version: CONSENT_VERSION, savedAt: Date.now() });
    setBannerVisible(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        showBanner: mounted && (bannerVisible ?? !acknowledged),
        acknowledge,
        openSettings: () => setBannerVisible(true),
        closeBanner: () => setBannerVisible(false),
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

const noop = () => {};

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (!context) {
    // Default values for SSR/static generation
    return { showBanner: false, acknowledge: noop, openSettings: noop, closeBanner: noop };
  }
  return context;
}
