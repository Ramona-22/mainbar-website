import Link from "next/link";

export const metadata = { title: "Impressum | MainBar" };

export default function ImpressumPage() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#a0a0a0] hover:text-[#cda1b1] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4">Impressum</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-10" />

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Angaben gemäß § 5 DDG</h2>
            <p className="text-[#4a4a4a]">
              [Vollständiger Name der Inhaberin / Firma]
              <br />
              MainBar
              <br />
              Spitalstraße 19
              <br />
              97421 Schweinfurt
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Kontakt</h2>
            <p className="text-[#4a4a4a]">
              Telefon: <a href="tel:+491702278096" className="hover:text-[#cda1b1]">+49 170 2278096</a>
              <br />
              E-Mail: <a href="mailto:info@mainbar-sw.de" className="hover:text-[#cda1b1]">info@mainbar-sw.de</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Umsatzsteuer-ID</h2>
            <p className="text-[#4a4a4a]">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr., falls vorhanden]
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="text-[#4a4a4a]">
              [Vollständiger Name der Inhaberin]
              <br />
              Spitalstraße 19, 97421 Schweinfurt
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">EU-Streitschlichtung</h2>
            <p className="text-[#4a4a4a]">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#cda1b1] underline"
              >
                ec.europa.eu/consumers/odr
              </a>
              . Unsere E-Mail-Adresse finden Sie oben. Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>

        <div className="mt-14 rounded-2xl border border-dashed border-[#cda1b1]/40 bg-[#cda1b1]/10 p-4 text-xs text-[#a0a0a0]">
          Hinweis für den Betreiber: Diese Seite ist eine Vorlage. Bitte alle eckigen Klammern mit
          den echten Angaben ausfüllen und vor Veröffentlichung anwaltlich prüfen lassen — z. B.
          über e-recht24.de oder einen Fachanwalt für IT-Recht.
        </div>
      </div>
    </main>
  );
}