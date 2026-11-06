import type { Metadata, Viewport } from "next";
import { Inter, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import CookieConsentBanner from "./components/CookieConsentBanner";
import LegalFooter from "./components/LegalFooter";
import { siteUrl } from "./siteUrl";

// Optimize fonts for faster mobile loading
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a161d" }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MainBar – Café & Bar in Schweinfurt | Frühstück, Wein & Events",
  description:
    "MainBar in der Spitalstraße 19, Schweinfurt: Frühstück, Winzerfladen, Kaffee, Wein und Drinks – plus Events & Catering. Di–Sa 9:30–18 Uhr, So 10–18 Uhr.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "MainBar",
    title: "MainBar | Café & Bar in Schweinfurt",
    description: "Frühstück, Winzerfladen, Kaffee und Drinks in der Spitalstraße 19, Schweinfurt.",
    images: ["/media/breakfast.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MainBar",
  },
};

// Local business data for Google (address, hours, phone). Keep in sync with
// the opening hours in the footer and the Impressum.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "MainBar",
  url: siteUrl,
  image: `${siteUrl}/media/breakfast.jpg`,
  telephone: "+49 170 2278096",
  servesCuisine: ["Frühstück", "Winzerfladen", "Kaffee", "Wein"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Spitalstraße 19",
    postalCode: "97421",
    addressLocality: "Schweinfurt",
    addressCountry: "DE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  sameAs: ["https://www.instagram.com/mainbar_sw/", "https://www.facebook.com/MainbarSW/"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${greatVibes.variable} ${playfair.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <CookieConsentProvider>
          {children}
          <LegalFooter />
          <CookieConsentBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}