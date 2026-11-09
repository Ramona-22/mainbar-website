"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { logConsent, newConsentId } from "../../lib/consentLog";

// The site sets no tracking, analytics or marketing cookies and embeds no
// third-party content that needs consent. The visitor's choice is stored in
// localStorage (so the notice is not shown again) and, as anonymous proof,
// in Firestore "cookieConsents" (random ID, version, time — see lib/consentLog).

export type ConsentRecord = {
  consentId: string;
  savedAt: number;
};

type CookieConsentContextType = {
  showBanner: boolean;
  consent: ConsentRecord | null;
  acknowledge: () => void;
  openSettings: () => void;
  closeBanner: () => void;
};

const STORAGE_KEY = "cookie-consent";
// Bump when the notice changes, so visitors see it again.
export const CONSENT_VERSION = 4;
// Show the notice again after 12 months (as stated in the Datenschutzerklärung).
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

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

type Stored = { version?: number; savedAt?: number; consentId?: string };

const parseStored = (raw: string | null | undefined): Stored | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Stored;
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
};

// Old, expired or malformed entries count as "not seen yet".
const validConsent = (stored: Stored | null): ConsentRecord | null => {
  if (
    !stored ||
    stored.version !== CONSENT_VERSION ||
    typeof stored.savedAt !== "number" ||
    Date.now() - stored.savedAt > MAX_AGE_MS ||
    typeof stored.consentId !== "string" ||
    !UUID_PATTERN.test(stored.consentId)
  ) {
    return null;
  }
  return { consentId: stored.consentId, savedAt: stored.savedAt };
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // undefined on the server / before hydration, so the notice only renders once mounted.
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readStored, () => undefined);
  const [savedThisVisit, setSavedThisVisit] = useState<ConsentRecord | null>(null);
  // null = default (show until acknowledged); true/false = opened/closed by the visitor.
  const [bannerVisible, setBannerVisible] = useState<boolean | null>(null);

  const mounted = raw !== undefined;
  const stored = useMemo(() => parseStored(raw), [raw]);
  const consent = savedThisVisit ?? validConsent(stored);

  const acknowledge = useCallback(() => {
    // Keep the visitor's existing random ID so renewals belong to one record trail.
    const previousId =
      typeof stored?.consentId === "string" && UUID_PATTERN.test(stored.consentId)
        ? stored.consentId
        : null;
    const record: ConsentRecord = { consentId: previousId ?? newConsentId(), savedAt: Date.now() };
    setSavedThisVisit(record);
    writeStored({ necessary: true, version: CONSENT_VERSION, ...record });
    setBannerVisible(false);
    logConsent(record.consentId, CONSENT_VERSION).catch((err) => {
      // The local choice still applies; only the server-side proof is missing.
      console.warn("[cookie-consent] could not save consent record:", err);
    });
  }, [stored]);

  const openSettings = useCallback(() => setBannerVisible(true), []);
  const closeBanner = useCallback(() => setBannerVisible(false), []);

  const value = useMemo(
    () => ({
      showBanner: mounted && (bannerVisible ?? !consent),
      consent,
      acknowledge,
      openSettings,
      closeBanner,
    }),
    [mounted, bannerVisible, consent, acknowledge, openSettings, closeBanner]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

const noop = () => {};

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  if (!context) {
    // Default values for SSR/static generation
    return { showBanner: false, consent: null, acknowledge: noop, openSettings: noop, closeBanner: noop };
  }
  return context;
}
