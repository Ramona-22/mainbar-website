import type { Metadata } from "next";

// Alternate design of the same content: keep it out of search results so it
// does not compete with the main pages as duplicate content.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
