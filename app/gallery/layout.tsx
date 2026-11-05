import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie – Café & Bar in Schweinfurt | MainBar",
  description: "Eindrücke aus der MainBar in der Spitalstraße 19, Schweinfurt: Frühstück, Drinks, Events und unsere Terrasse.",
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Galerie – Café & Bar in Schweinfurt | MainBar", description: "Eindrücke aus der MainBar in der Spitalstraße 19, Schweinfurt: Frühstück, Drinks, Events und unsere Terrasse.", url: "/gallery" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
