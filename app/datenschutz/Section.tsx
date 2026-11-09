import type { ReactNode } from "react";

// Shared building blocks for the German and English privacy policy.
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">{title}</h2>
      <div className="space-y-3 text-[#4a4a4a]">{children}</div>
    </section>
  );
}

export const linkClass = "text-[#b5788f] underline underline-offset-2";
