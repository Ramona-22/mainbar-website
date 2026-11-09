import Link from "next/link";

// German Impressum (the legally binding version).
export default function ImpressumDe() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#6b6b6b] hover:text-[#b5788f] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4">Impressum</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-10" />

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Angaben gemäß § 5 DDG</h2>
            <p className="text-[#4a4a4a]">
              Ramona Krines
              <br />
              MainBar drinks &amp; food (Einzelunternehmen)
              <br />
              Spitalstraße 19
              <br />
              97421 Schweinfurt
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Kontakt</h2>
            <p className="text-[#4a4a4a]">
              Telefon: <a href="tel:+491702278096" className="hover:text-[#b5788f]">+49 170 2278096</a>
              <br />
              E-Mail:{" "}
              <a href="mailto:ramonakrines@gmail.com" className="hover:text-[#b5788f]">
                ramonakrines@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Umsatzsteuer-ID</h2>
            <p className="text-[#4a4a4a]">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE357534577
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p className="text-[#4a4a4a]">
              Ramona Krines
              <br />
              Spitalstraße 19, 97421 Schweinfurt
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Verbraucherstreitbeilegung</h2>
            <p className="text-[#4a4a4a]">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Haftung für Inhalte und Links</h2>
            <p className="text-[#4a4a4a]">
              Die Inhalte dieser Seiten wurden mit Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität übernehmen wir jedoch keine Gewähr. Für Inhalte externer
              Websites, auf die wir verlinken, sind ausschließlich deren Betreiber verantwortlich; zum
              Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Bei Bekanntwerden von
              Rechtsverletzungen entfernen wir entsprechende Inhalte oder Links umgehend.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">Bildnachweise</h2>
            <p className="text-[#4a4a4a]">Fotos und Videos: MainBar drinks &amp; food, Schweinfurt.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
