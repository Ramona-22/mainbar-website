import Link from "next/link";
import { Section, linkClass } from "./Section";

// German privacy policy (the legally binding version).
export default function DatenschutzDe() {
  return (
    <main className="min-h-screen w-full bg-[#faf8f5] px-6 py-20 md:py-28">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[#6b6b6b] hover:text-[#b5788f] uppercase tracking-widest text-[10px] md:text-xs transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2d2d2d] mt-6 mb-4 break-words">Datenschutzerklärung</h1>
        <div className="w-12 h-px bg-[#cda1b1] mb-4" />
        <p className="text-xs text-[#6b6b6b] mb-10">Stand: November 2026</p>

        <div className="space-y-8 text-sm text-[#2d2d2d] leading-relaxed">
          <Section title="1. Verantwortlicher">
            <p>
              MainBar drinks &amp; food, Inhaberin: Ramona Krines (Einzelunternehmen)
              <br />
              Spitalstraße 19, 97421 Schweinfurt
              <br />
              E-Mail: <a href="mailto:ramonakrines@gmail.com" className={linkClass}>ramonakrines@gmail.com</a>
              <br />
              Telefon: <a href="tel:+491702278096" className={linkClass}>+49 170 2278096</a>
            </p>
          </Section>

          <Section title="2. Überblick">
            <p>
              Wir verarbeiten personenbezogene Daten nur, soweit dies für den Betrieb dieser Website, die
              Bearbeitung Ihrer Anfragen oder die Anzeige Ihrer Bewertung erforderlich ist. Wir setzen
              keine Analyse-, Tracking- oder Werbe-Cookies ein und erstellen keine Nutzungsprofile. Die
              Übertragung zwischen Ihrem Browser und unserer Website ist per TLS (HTTPS) verschlüsselt.
            </p>
          </Section>

          <Section title="3. Hosting und Server-Logfiles">
            <p>
              Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA,
              gehostet. Beim Aufruf der Website verarbeitet der Hosting-Anbieter automatisch technische
              Daten (Server-Logfiles), insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene
              Seite, Referrer und Browsertyp. Dies ist erforderlich, um die Website auszuliefern und ihre
              Sicherheit und Stabilität zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Mit Vercel besteht ein Auftragsverarbeitungsvertrag. Eine Übermittlung in die USA erfolgt auf
              Grundlage des EU-US Data Privacy Framework, unter dem Vercel zertifiziert ist, sowie ergänzend
              auf Grundlage von Standardvertragsklauseln der EU-Kommission.
            </p>
          </Section>

          <Section title="4. Schutz vor Missbrauch">
            <p>
              Beim Absenden des Buchungsformulars, einer Bewertung oder eines Löschantrags verarbeiten wir
              Ihre IP-Adresse (bei Buchungen und Löschanträgen auch die angegebene E-Mail-Adresse), um
              die Anzahl der Anfragen pro Absender und pro Empfänger zu begrenzen und so massenhaft versendete Spam-Anfragen zu verhindern. Beide
              Angaben werden dafür nur kurzzeitig gespeichert (höchstens ca. 20 Minuten), im
              Arbeitsspeicher unseres Servers und ggf. bei unserem Dienstleister
              Upstash, Inc. (Redis-Datenbank). Rechtsgrundlage ist unser berechtigtes Interesse an der
              Sicherheit der Website (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </Section>

          <Section title="5. Event- & Catering-Anfrage (Buchungsformular)">
            <p>
              Wenn Sie über das Buchungsformular eine Anfrage stellen, verarbeiten wir: gewünschten
              Bereich (innen, außen oder Catering), Anzahl der Gäste, Datum, Bundesland, Stadt,
              Telefonnummer und E-Mail-Adresse.
            </p>
            <p>
              Ihre Angaben werden zunächst von unserem Server geprüft, anschließend per E-Mail an uns
              gesendet und in unserer Firebase-Datenbank (siehe Ziffer 10) gespeichert, damit wir die
              Anfrage bearbeiten können. Sie erhalten eine Eingangsbestätigung per E-Mail, die nur Datum,
              Personenzahl und Bereich enthält.
            </p>
            <p>
              Rechtsgrundlage ist die Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage
              (Art. 6 Abs. 1 lit. b DSGVO) sowie Ihre Einwilligung über die Checkbox im Formular
              (Art. 6 Abs. 1 lit. a DSGVO). Die Daten werden gelöscht, sobald die Anfrage abschließend
              bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </Section>

          <Section title="6. E-Mail-Versand">
            <p>
              Für den Versand der Anfrage- und Bestätigungs-E-Mails nutzen wir den E-Mail-Dienst Gmail der
              Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Dabei werden die
              Inhalte der E-Mail und die beteiligten E-Mail-Adressen von Google verarbeitet. Eine
              Übermittlung an die Google LLC in den USA ist möglich; Google ist unter dem EU-US Data
              Privacy Framework zertifiziert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.
            </p>
          </Section>

          <Section title="7. Bewertungen">
            <p>
              Wenn Sie auf der Startseite eine Bewertung abgeben, speichern wir den angegebenen Vornamen,
              die Sternebewertung, Ihren Text und den Zeitpunkt der Abgabe. Bewertungen werden erst nach
              einer Prüfung durch uns auf der Website veröffentlicht; wir können Bewertungen ablehnen oder
              entfernen, etwa bei beleidigenden Inhalten oder Spam.
            </p>
            <p>
              Rechtsgrundlage ist Ihre Einwilligung durch das Absenden des Formulars samt Checkbox
              (Art. 6 Abs. 1 lit. a DSGVO). Die Bewertungen werden in Firebase gespeichert (Ziffer 10).
              Sie können Ihre Einwilligung jederzeit widerrufen und die Löschung verlangen (Ziffer 12).
            </p>
          </Section>

          <Section title="8. Löschanträge über die Website">
            <p>
              Über den Link „Daten löschen“ auf der Startseite können Sie die Löschung Ihrer Daten
              beantragen. Die angegebene E-Mail-Adresse wird dabei per E-Mail an uns übermittelt. Wir
              prüfen den Antrag, löschen die zugehörigen Anfragen und Bewertungen und bestätigen Ihnen die
              Löschung per E-Mail, spätestens innerhalb eines Monats. Rechtsgrundlage ist die Erfüllung
              unserer rechtlichen Pflichten (Art. 6 Abs. 1 lit. c i. V. m. Art. 17 DSGVO).
            </p>
          </Section>

          <Section title="9. Cookies und lokale Speicherung">
            <p>
              Diese Website setzt keine Cookies zu Analyse-, Tracking- oder Werbezwecken und bindet keine
              Inhalte Dritter ein, für die eine Einwilligung erforderlich wäre. Gespeichert wird
              im Local Storage Ihres Browsers (Eintrag „cookie-consent“) Ihre Auswahl im Cookie-Hinweis
              samt Zeitpunkt, Version des Hinweises und einer zufällig erzeugten Kennung, damit der
              Hinweis nicht bei jedem Besuch erneut erscheint. Diese Speicherung ist unbedingt
              erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Nach 12 Monaten wird der Hinweis erneut angezeigt.
            </p>
            <p>
              Beim ersten Besuch der Startseite wird eine kurze Begrüßungsanimation gezeigt. Damit sie
              nicht bei jedem Seitenaufruf erneut abläuft, speichern wir im Local Storage den Eintrag
              „mb-intro-seen“ mit dem Wert „1“. Er enthält keine Angaben zu Ihrer Person, wird nicht an
              uns oder Dritte übertragen und dient allein der Darstellung der Website, wie Sie sie
              aufrufen (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können ihn jederzeit über die Einstellungen Ihres
              Browsers löschen; die Animation wird dann erneut gezeigt.
            </p>
            <p>
              Wenn Sie die Website auf Englisch umstellen, speichern wir im Local Storage den Eintrag
              „mb-lang“ mit dem Wert „en“, damit die gewählte Sprache bei Ihrem nächsten Seitenaufruf
              erhalten bleibt. Der Eintrag wird nur bei Wahl der englischen Sprache angelegt und beim
              Zurückwechseln auf Deutsch wieder entfernt. Er enthält keine Angaben zu Ihrer Person, wird
              nicht an uns oder Dritte übertragen und dient allein der von Ihnen gewünschten Darstellung
              der Website (§ 25 Abs. 2 Nr. 2 TDDDG).
            </p>
            <p>
              Als Nachweis Ihrer Auswahl speichern wir zusätzlich einen anonymen Datensatz in unserer
              Firebase-Datenbank (Ziffer 10): die zufällige Kennung, die Version des Hinweises und den
              Zeitpunkt. IP-Adresse, Browserdaten oder andere Angaben zu Ihrer Person speichern wir dabei
              nicht; beim Speichern wird Ihre IP-Adresse technisch bedingt an Google übermittelt. Der
              Datensatz wird nach drei Jahren automatisch gelöscht. Rechtsgrundlage ist unsere
              Nachweispflicht (Art. 5 Abs. 2, Art. 7 Abs. 1 i. V. m. Art. 6 Abs. 1 lit. c und f DSGVO).
            </p>
            <p>
              Den Hinweis können Sie jederzeit über „Cookie-Einstellungen“ am Seitenende erneut aufrufen;
              dort sehen Sie auch Zeitpunkt und Kennung Ihrer gespeicherten Auswahl. Den Eintrag im Browser
              können Sie über die Einstellungen Ihres Browsers löschen.
            </p>
          </Section>

          <Section title="10. Firebase (Google Cloud)">
            <p>
              Für die Speisekarte, Bewertungen, Buchungsanfragen und die Nachweise zu Cookie-Einstellungen
              nutzen wir die Datenbank Firebase
              Cloud Firestore der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
              Beim Aufruf der Startseite lädt Ihr Browser die Speisekarte und die veröffentlichten
              Bewertungen direkt von Servern von Google; dabei wird Ihre IP-Adresse an Google übermittelt.
              Rechtsgrundlage ist unser berechtigtes Interesse an der Darstellung aktueller Inhalte
              (Art. 6 Abs. 1 lit. f DSGVO) bzw. für Anfragen und Bewertungen die in Ziffer 5 und 7
              genannten Grundlagen.
            </p>
            <p>
              Mit Google besteht ein Auftragsverarbeitungsvertrag. Eine Übermittlung an die Google LLC in
              den USA ist möglich; Google ist unter dem EU-US Data Privacy Framework zertifiziert.
            </p>
          </Section>

          <Section title="11. Schriftarten und externe Links">
            <p>
              Die verwendeten Schriftarten werden von unserem eigenen Server ausgeliefert; beim Seitenaufruf
              wird keine Verbindung zu Google Fonts hergestellt.
            </p>
            <p>
              Wir verlinken auf unser Profil bei Instagram (Meta Platforms Ireland Ltd.) und auf Google
              Maps. Es handelt sich um einfache Links: Daten werden erst übertragen, wenn Sie einen Link
              anklicken und unsere Website verlassen. Dann gelten die Datenschutzbestimmungen des
              jeweiligen Anbieters.
            </p>
          </Section>

          <Section title="12. Ihre Rechte">
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
              Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Zur Ausübung genügt eine E-Mail an{" "}
              <a href="mailto:ramonakrines@gmail.com" className={linkClass}>ramonakrines@gmail.com</a> oder der
              Link „Daten löschen“ auf der Startseite.
            </p>
            <p>
              <strong>Widerruf Ihrer Einwilligung:</strong> Eine erteilte Einwilligung können Sie jederzeit
              mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO), z. B. per E-Mail. Die
              Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt.
            </p>
            <p>
              <strong>Widerspruchsrecht:</strong> Soweit wir Daten auf Grundlage berechtigter Interessen
              (Art. 6 Abs. 1 lit. f DSGVO) verarbeiten, können Sie aus Gründen, die sich aus Ihrer
              besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).
            </p>
            <p>
              <strong>Beschwerderecht:</strong> Sie können sich bei einer Datenschutz-Aufsichtsbehörde
              beschweren, z. B. beim Bayerischen Landesamt für Datenschutzaufsicht, Promenade 18,
              91522 Ansbach.
            </p>
            <p>
              Die Angabe Ihrer Daten in den Formularen ist freiwillig; ohne sie können wir Ihre Anfrage
              jedoch nicht bearbeiten bzw. Ihre Bewertung nicht veröffentlichen. Eine automatisierte
              Entscheidungsfindung einschließlich Profiling findet nicht statt.
            </p>
          </Section>

          <Section title="13. Speicherdauer">
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
              erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen (z. B. bis zu 10 Jahre für
              steuerrelevante Unterlagen bei zustande gekommenen Aufträgen). Buchungsanfragen und
              Bewertungen löschen wir nach Abschluss der Bearbeitung bzw. auf Ihren Wunsch. Anonyme
              Nachweise zu Cookie-Einstellungen werden nach drei Jahren automatisch gelöscht.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
