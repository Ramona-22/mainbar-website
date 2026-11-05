import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt – Spitalstraße 19, Schweinfurt | MainBar",
  description: "So erreichen Sie die MainBar: Spitalstraße 19, 97421 Schweinfurt. Öffnungszeiten Di–Sa 9:30–18 Uhr, So 10–18 Uhr.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Kontakt & Anfahrt – Spitalstraße 19, Schweinfurt | MainBar", description: "So erreichen Sie die MainBar: Spitalstraße 19, 97421 Schweinfurt. Öffnungszeiten Di–Sa 9:30–18 Uhr, So 10–18 Uhr.", url: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
