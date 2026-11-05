import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Speisekarte – Frühstück, Winzerfladen & Drinks | MainBar Schweinfurt",
  description: "Die Speisekarte der MainBar in Schweinfurt: Frühstück, Geschmackssachen, Winzerfladen, Kaffee, Wein, Aperitif und Longdrinks.",
  alternates: { canonical: "/menu" },
  openGraph: { title: "Speisekarte – Frühstück, Winzerfladen & Drinks | MainBar Schweinfurt", description: "Die Speisekarte der MainBar in Schweinfurt: Frühstück, Geschmackssachen, Winzerfladen, Kaffee, Wein, Aperitif und Longdrinks.", url: "/menu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
