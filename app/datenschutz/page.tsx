import Link from "next/link";

export const metadata = { title: "Datenschutzerklärung | MainBar" };

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#a0a0a0] hover:text-[#cda1b1] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4">
          Datenschutzerklärung
        </h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-10" />

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">1. Verantwortlicher</h2>
            <p className="text-[#4a4a4a]">
              MainBar, Inhaberin: [Name der Inhaberin], Spitalstraße 19, 97421 Schweinfurt<br />
              E-Mail: info@mainbar-sw.de<br />
              Telefon: +49 170 2278096
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">2. Hosting</h2>
            <p className="text-[#4a4a4a]">
              Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet.
              Beim Aufruf der Website erhebt der Hosting-Anbieter automatisch technische Informationen
              (Server-Logfiles), u. a. IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite
              und Browsertyp. Diese Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses
              an einem sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).
              Mit Vercel wurde ein Auftragsverarbeitungsvertrag (AVV) geschlossen. Die Datenübertragung
              in die USA erfolgt auf Basis von Standardvertragsklauseln.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">3. Event- & Catering-Anfrage (Buchungsformular)</h2>
            <p className="text-[#4a4a4a]">
              Wenn Sie über das Buchungsformular eine Event- oder Catering-Anfrage stellen, verarbeiten wir
              folgende personenbezogene Daten: Sitzplatzwahl, Anzahl der Gäste, Datum, Bundesland, Stadt,
              Telefonnummer und E-Mail-Adresse. Diese Daten werden zwecks Bearbeitung Ihrer Anfrage
              in unserer Firebase-Datenbank (Google Cloud, Irland) gespeichert und per E-Mail (Nodemailer
              über Gmail) an uns sowie als Bestätigung an Sie versendet. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. b DSGVO (vorvertragliche Maßnahmen) sowie Ihre ausdrückliche Einwilligung per
              Checkbox (Art. 6 Abs. 1 lit. a DSGVO). Die Daten werden gelöscht, sobald die Anfrage
              abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              Für den E-Mail-Versand nutzen wir Gmail (Google Ireland Ltd., Gordon House, Barrow Street,
              Dublin 4, Irland) – hierfür besteht ein AVV und die Datenverarbeitung erfolgt innerhalb der EU.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">4. Bewertungen</h2>
            <p className="text-[#4a4a4a]">
              Wenn Sie über das Bewertungsformular auf unserer Startseite eine Bewertung abgeben,
              speichern wir den von Ihnen angegebenen Vornamen, Ihre Bewertung (Sterne) und Ihren Text,
              um diese auf der Website anzuzeigen. Rechtsgrundlage ist Ihre Einwilligung durch das
              aktive Absenden des Formulars samt Checkbox (Art. 6 Abs. 1 lit. a DSGVO). Die Bewertungen
              werden in Firebase (Google Cloud, Irland) gespeichert. Sie können die Löschung Ihrer
              Bewertung jederzeit per E-Mail an info@mainbar-sw.de beantragen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">5. Cookies & Cookie-Consent</h2>
            <p className="text-[#4a4a4a]">
              Wir nutzen ein Cookie-Consent-Tool, das Ihre Einwilligung in verschiedene Cookie-Kategorien
              einholt und dokumentiert. Folgende Kategorien werden unterschieden:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#4a4a4a] mt-2 ml-4">
              <li><strong>Essenzielle Cookies (immer aktiv):</strong> Notwendig für den Betrieb der Website
                (z. B. Spracheinstellung, Sitzung, Cookie-Consent-Status). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</li>
              <li><strong>Funktionale Cookies (nach Einwilligung):</strong> Ermöglichen erweiterte Funktionen
                wie Google Maps (Kartenansicht auf der Kontaktseite), eingebettete Videos und Google Fonts.
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</li>
              <li><strong>Analytics Cookies (nach Einwilligung):</strong> Firebase Analytics zur pseudonymisierten
                Nutzungsanalyse. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</li>
              <li><strong>Marketing Cookies:</strong> Werden aktuell nicht eingesetzt.</li>
            </ul>
            <p className="text-[#4a4a4a] mt-2">
              Ihre Einwilligung wird in einem LocalStorage-Cookie (cookie-consent) für 12 Monate gespeichert.
              Sie können Ihre Einstellungen jederzeit über den Link „Cookie-Einstellungen“ im Footer widerrufen
              oder anpassen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">6. Google Maps</h2>
            <p className="text-[#4a4a4a]">
              Auf der Kontaktseite binden wir eine Google Maps-Karte ein. Diese wird erst geladen, wenn Sie
              in funktionale Cookies eingewilligt haben oder explizit auf „Karte laden & Einwilligen“ klicken.
              Anbieter: Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland. Dabei werden
              Ihre IP-Adresse und ggf. weitere Browserdaten an Google übermittelt. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#cda1b1] hover:underline">Google Datenschutzerklärung</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">7. Google Fonts</h2>
            <p className="text-[#4a4a4a]">
              Wir nutzen Google Fonts (Inter, Great Vibes, Playfair Display) über das next/font-Modul von Next.js.
              Die Schriftarten werden lokal (self-hosted) ausgeliefert, es findet keine Verbindung zu
              Google-Servern beim Seitenaufruf statt. Somit werden keine personenbezogenen Daten an Google
              übermittelt.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">8. Firebase (Google Cloud)</h2>
            <p className="text-[#4a4a4a]">
              Für die Speicherung von Buchungsanfragen, Bewertungen und Menüdaten nutzen wir
              Firebase Firestore (Google Cloud, Region: europe-west1 / Irland). Es besteht ein
              Auftragsverarbeitungsvertrag (AVV) mit Google. Die Datenverarbeitung erfolgt auf
              Servern in der EU. Rechtsgrundlage für die Speicherung: Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung bei Bewertungen).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">9. Soziale Medien</h2>
            <p className="text-[#4a4a4a]">
              Auf unserer Website verlinken wir zu unseren Profilen auf Instagram und Facebook.
              Beim Klick auf die Links verlassen Sie unsere Website. Für die Datenverarbeitung
              durch Meta (Facebook/Instagram) sind wir nicht verantwortlich. Bitte beachten Sie
              die jeweiligen Datenschutzerklärungen der Anbieter.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">10. Ihre Rechte</h2>
            <p className="text-[#4a4a4a]">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
              Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Ihrer
              Daten (Art. 15–21 DSGVO). Zudem haben Sie das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde zu beschweren, z. B. beim Bayerischen Landesamt für
              Datenschutzaufsicht (Promenade 18, 91522 Ansbach).
            </p>
            <p className="text-[#4a4a4a] mt-2">
              Zur Ausübung Ihrer Rechte (z. B. Löschung Ihrer Buchungsanfrage oder Bewertung)
              kontaktieren Sie uns bitte per E-Mail an info@mainbar-sw.de.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-[#2d2d2d] mb-2">11. Speicherdauer</h2>
            <p className="text-[#4a4a4a]">
              Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen
              Verarbeitungszweck erforderlich ist oder gesetzliche Aufbewahrungspflichten
              (z. B. steuerrechtlich 10 Jahre für Rechnungsdaten) bestehen. Buchungsanfragen
              und Bewertungen werden nach Abschluss der Bearbeitung bzw. auf Ihren Wunsch hin
              gelöscht.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
