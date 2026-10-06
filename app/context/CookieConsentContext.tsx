"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cookie-consent");
    if (saved) {
      try {
        setConsent(JSON.parse(saved));
      } catch {
        setConsent(null);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveToStorage = (newConsent: CookieConsent) => {
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
    setConsent(newConsent);
  };

  const acceptAll = () => {
    const newConsent = { necessary: true, analytics: true, marketing: true, functional: true };
    saveToStorage(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptNecessaryOnly = () => {
    const newConsent = { ...defaultConsent };
    saveToStorage(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (preferences: Partial<CookieConsent>) => {
    const newConsent = { ...consent, ...preferences, necessary: true } as CookieConsent;
    saveToStorage(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const openBanner = () => setShowBanner(true);
  const openSettings = () => {
    setShowBanner(true);
    setShowSettings(true);
  };
  const closeBanner = () => {
    setShowBanner(false);
    setShowSettings(false);
  };

  const resetConsent = () => {
    localStorage.removeItem("cookie-consent");
    setConsent(null);
    setShowBanner(true);
    setShowSettings(false);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented: consent !== null,
        showBanner: showBanner && consent === null,
        showSettings,
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