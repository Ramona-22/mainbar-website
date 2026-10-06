import type { Metadata, Viewport } from "next";
import { Inter, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import CookieConsentBanner from "./components/CookieConsentBanner";

// Optimize fonts for faster mobile loading
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Strict mobile viewport settings to prevent accidental zooming on iOS/Android
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a161d" }
  ],
};

export const metadata: Metadata = {
  title: "MainBar | Schweinfurt",
  description: "Bei uns ist Qualität das Produkt der Liebe zum Detail.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MainBar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${greatVibes.variable} ${playfair.variable} font-sans antialiased`}>
        <CookieConsentProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <CookieConsentBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}