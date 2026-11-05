import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event & Catering anfragen | MainBar Schweinfurt",
  description: "Feiern, Firmenevents oder Catering in Schweinfurt: Fragen Sie Ihr Event in der MainBar unverbindlich online an.",
  alternates: { canonical: "/booking" },
  openGraph: { title: "Event & Catering anfragen | MainBar Schweinfurt", description: "Feiern, Firmenevents oder Catering in Schweinfurt: Fragen Sie Ihr Event in der MainBar unverbindlich online an.", url: "/booking" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
