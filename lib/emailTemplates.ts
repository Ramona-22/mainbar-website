import { escapeHtml } from "./bookingValidation";

/*
  Booking emails, built like the Yetenbi emails (dark card with a fine border,
  spaced-out name, details table with small coloured labels, one round button,
  address footer) in MainBar's colours: charcoal, rose and cream.
  Email clients ignore <style> tags, so every element carries inline styles.
  Every value is escaped. The guest email never repeats free text the visitor typed
  (city, state, phone), so the form cannot be used to send someone else spam text.
*/

const SITE = "https://www.mainbarsw.de";
const colors = {
  page: "#141214",
  card: "#1c1a1d",
  border: "#6b4f59",
  divider: "#332c31",
  text: "#faf8f5",
  body: "#e6dde0",
  muted: "#a99ca1",
  rose: "#cda1b1",
  roseLight: "#e6d0d8",
};

export type BookingMailData = {
  seating: "inside" | "outside" | "catering";
  guests: number;
  date: string; // YYYY-MM-DD
  state: string;
  city: string;
  phone: string;
  email: string;
};

const SEATING: Record<BookingMailData["seating"], string> = {
  inside: "Innenbereich",
  outside: "Außenbereich",
  catering: "Externes Catering",
};

/** "2026-12-20" -> "Sonntag, 20. Dezember 2026" */
export function formatGermanDate(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const guestsLabel = (n: number) => `${n} ${n === 1 ? "Person" : "Personen"}`;

/* ------------------------------------------------------------------ */
/*  Building blocks                                                     */
/* ------------------------------------------------------------------ */

/** The dark card every email is wrapped in: name, heading, body and the address. */
function emailLayout(heading: string, body: string) {
  const footer = "Spitalstraße 19, 97421 Schweinfurt · +49 170 2278096";
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>MainBar</title></head>
<body style="margin:0;background:${colors.page};font-family:Georgia,'Times New Roman',serif;color:${colors.text}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.page};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border:1px solid ${colors.border};background:${colors.card}">
        <tr><td style="padding:28px 32px 8px;text-align:center;letter-spacing:6px;font-size:22px;color:${colors.roseLight};font-weight:bold">MAINBAR</td></tr>
        <tr><td style="padding:0 32px 18px;text-align:center;font-size:11px;letter-spacing:3px;color:${colors.muted};text-transform:uppercase">Café &amp; Bistro · Schweinfurt</td></tr>
        <tr><td style="padding:0 32px"><div style="border-top:1px solid ${colors.border}"></div></td></tr>
        <tr><td style="padding:26px 32px 4px;font-size:22px;color:${colors.text}">${heading}</td></tr>
        <tr><td style="padding:8px 32px 30px;font-size:16px;line-height:1.6;color:${colors.body}">${body}</td></tr>
        <tr><td style="padding:16px 32px 26px;font-size:12px;color:${colors.muted};border-top:1px solid ${colors.divider}">${footer}<br>
          <a href="${SITE}" style="color:${colors.muted}">mainbarsw.de</a> ·
          <a href="https://www.instagram.com/mainbar_sw/" style="color:${colors.muted}">Instagram</a> ·
          <a href="${SITE}/impressum" style="color:${colors.muted}">Impressum</a> ·
          <a href="${SITE}/datenschutz" style="color:${colors.muted}">Datenschutz</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** A paragraph of plain text (escaped). */
function paragraph(text: string, style = "") {
  return `<p style="margin:0;${style}">${escapeHtml(text)}</p>`;
}

function button(href: string, text: string) {
  const style = `display:inline-block;background:${colors.rose};color:${colors.card};padding:12px 22px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold`;
  return `<p style="margin:20px 0 0"><a href="${escapeHtml(href)}" style="${style}">${escapeHtml(text)}</a></p>`;
}

/** Label/value rows. Values are escaped unless passed as { html }. */
function detailsTable(rows: [label: string, value: string | { html: string }][]) {
  const labelStyle = `padding:6px 0;color:${colors.rose};font-size:12px;letter-spacing:2px;text-transform:uppercase;width:40%;vertical-align:top`;
  const html = rows
    .map(
      ([label, value]) =>
        `<tr><td style="${labelStyle}">${escapeHtml(label)}</td><td style="padding:6px 0;font-size:17px;color:${colors.text}">${
          typeof value === "string" ? escapeHtml(value) : value.html
        }</td></tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;width:100%">${html}</table>`;
}

const link = (href: string, text: string) =>
  `<a href="${escapeHtml(href)}" style="color:${colors.roseLight};text-decoration:none">${escapeHtml(text)}</a>`;

/* ------------------------------------------------------------------ */
/*  Guest confirmation                                                  */
/* ------------------------------------------------------------------ */

export function guestConfirmation(b: BookingMailData) {
  const date = formatGermanDate(b.date);
  const guests = guestsLabel(b.guests);
  const area = SEATING[b.seating];

  let body = paragraph(
    "Wir haben Ihre Anfrage erhalten und prüfen die Verfügbarkeit."
  );
  body += detailsTable([
    ["Datum", date],
    ["Gäste", guests],
    ["Bereich", area],
  ]);
  body += paragraph("Wir melden uns in Kürze persönlich bei Ihnen.");
  body += button(`${SITE}/#menu-section`, "Speisekarte ansehen");
  body += paragraph(
    "Öffnungszeiten: Di–Sa 09:30–18:00 Uhr · Sonn- & Feiertage 10:00–18:00 Uhr · Montag Ruhetag",
    `margin-top:22px;font-size:13px;color:${colors.muted}`
  );
  body += paragraph("Ihr MainBar Team", `margin-top:22px;color:${colors.muted}`);

  const text = [
    "Vielen Dank für Ihre Anfrage bei MainBar!",
    "",
    `Datum: ${date}`,
    `Gäste: ${guests}`,
    `Bereich: ${area}`,
    "",
    "Wir prüfen die Verfügbarkeit und melden uns in Kürze persönlich bei Ihnen.",
    "",
    "Öffnungszeiten: Di–Sa 09:30–18:00 Uhr, Sonn- & Feiertage 10:00–18:00 Uhr, Montag Ruhetag",
    "",
    "Ihr MainBar Team",
    "Spitalstraße 19, 97421 Schweinfurt · +49 170 2278096",
    SITE,
  ].join("\n");

  return {
    subject: "Ihre Anfrage bei MainBar ist eingegangen",
    html: emailLayout("Vielen Dank für Ihre Anfrage", body),
    text,
  };
}

/* ------------------------------------------------------------------ */
/*  Owner alert                                                         */
/* ------------------------------------------------------------------ */

export function ownerAlert(b: BookingMailData) {
  const date = formatGermanDate(b.date);
  const guests = guestsLabel(b.guests);
  const area = SEATING[b.seating];
  const tel = b.phone.replace(/[^\d+]/g, "");

  const body =
    detailsTable([
      ["Datum", date],
      ["Gäste", guests],
      ["Bereich", area],
      ["Ort", `${b.city}, ${b.state}`],
      ["Telefon", tel ? { html: link(`tel:${tel}`, b.phone) } : b.phone],
      ["E-Mail", { html: link(`mailto:${b.email}`, b.email) }],
    ]) +
    button(`${SITE}/admin`, "Im Admin öffnen") +
    paragraph("Tipp: „Antworten“ in Ihrem Mailprogramm schreibt direkt an den Gast.", `margin-top:20px;font-size:13px;color:${colors.muted}`);

  const text = [
    "Neue Event-/Catering-Anfrage über die Website",
    "",
    `Datum: ${date}`,
    `Gäste: ${guests}`,
    `Bereich: ${area}`,
    `Ort: ${b.city}, ${b.state}`,
    `Telefon: ${b.phone}`,
    `E-Mail: ${b.email}`,
    "",
    `Admin: ${SITE}/admin`,
  ].join("\n");

  return {
    subject: `Neue Anfrage: ${guests} am ${date}`,
    html: emailLayout("Neue Event-Anfrage", body),
    text,
  };
}
