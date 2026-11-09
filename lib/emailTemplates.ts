import { escapeHtml } from "./bookingValidation";

/*
  Booking emails in the website's style (cream, rose, charcoal), built for email
  clients: table layout, inline styles, web-safe fonts, no images or scripts.
  Every value is escaped. The guest email never repeats free text the visitor typed
  (city, state, phone), so the form cannot be used to send someone else spam text.
*/

const SITE = "https://www.mainbarsw.de";
const C = {
  page: "#f3ece9",
  paper: "#faf8f5",
  card: "#ffffff",
  rose: "#cda1b1",
  roseDeep: "#b5788f",
  ink: "#2d2d2d",
  muted: "#6b6b6b",
  line: "#eadfe3",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

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
    timeZone: "Europe/Berlin",
  });
}

const guestsLabel = (n: number) => `${n} ${n === 1 ? "Person" : "Personen"}`;

/* ------------------------------------------------------------------ */
/*  Building blocks                                                     */
/* ------------------------------------------------------------------ */

function layout(preheader: string, body: string) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>MainBar</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.paper};border-radius:18px;overflow:hidden;">
      <tr><td style="height:4px;background:${C.rose};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:40px 32px 8px;">
        <div style="font-family:${SERIF};font-style:italic;font-size:40px;line-height:1;color:${C.rose};">MainBar</div>
        <div style="font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.muted};padding-top:10px;">drinks &amp; food</div>
        <div style="width:48px;height:1px;background:${C.rose};margin:22px auto 0;font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      ${body}
      <tr><td style="padding:28px 32px 36px;border-top:1px solid ${C.line};" align="center">
        <div style="font-family:${SANS};font-size:12px;line-height:20px;color:${C.muted};">
          MainBar drinks &amp; food · Spitalstraße 19 · 97421 Schweinfurt<br>
          <a href="tel:+491702278096" style="color:${C.muted};text-decoration:none;">+49 170 2278096</a> ·
          <a href="${SITE}" style="color:${C.muted};text-decoration:none;">mainbarsw.de</a> ·
          <a href="https://www.instagram.com/mainbar_sw/" style="color:${C.muted};text-decoration:none;">Instagram</a>
        </div>
        <div style="font-family:${SANS};font-size:11px;line-height:18px;color:#9a9a9a;padding-top:10px;">
          <a href="${SITE}/impressum" style="color:#9a9a9a;">Impressum</a> ·
          <a href="${SITE}/datenschutz" style="color:#9a9a9a;">Datenschutz</a>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function detailRows(rows: [string, string][]) {
  return rows
    .map(
      ([label, value], i) => `<tr>
        <td style="padding:14px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};width:42%;vertical-align:top;">${label}</td>
        <td style="padding:14px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SERIF};font-size:17px;color:${C.ink};vertical-align:top;">${value}</td>
      </tr>`
    )
    .join("");
}

function card(inner: string) {
  return `<tr><td style="padding:8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.card};border:1px solid ${C.line};border-radius:14px;">
      <tr><td style="padding:10px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${inner}</table>
      </td></tr>
    </table>
  </td></tr>`;
}

function button(href: string, label: string, filled = true) {
  return `<a href="${href}" style="display:inline-block;margin:4px;padding:13px 26px;border-radius:999px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;${
    filled
      ? `background:${C.rose};color:#1c1a1d;border:1px solid ${C.rose};`
      : `background:transparent;color:${C.roseDeep};border:1px solid ${C.rose};`
  }">${label}</a>`;
}

/* ------------------------------------------------------------------ */
/*  Guest confirmation                                                  */
/* ------------------------------------------------------------------ */

export function guestConfirmation(b: BookingMailData) {
  const date = escapeHtml(formatGermanDate(b.date));
  const guests = guestsLabel(b.guests);
  const area = SEATING[b.seating];

  const html = layout(
    `Wir haben Ihre Anfrage für ${date} erhalten.`,
    `<tr><td align="center" style="padding:28px 32px 8px;">
      <div style="font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.roseDeep};">Ihre Anfrage ist eingegangen</div>
      <h1 style="margin:14px 0 0;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:36px;color:${C.ink};">Vielen Dank für Ihre Anfrage</h1>
      <p style="margin:14px 0 18px;font-family:${SANS};font-size:15px;line-height:24px;color:${C.muted};">
        Schön, dass Sie mit uns feiern möchten. Wir prüfen die Verfügbarkeit
        und melden uns in Kürze persönlich bei Ihnen.
      </p>
    </td></tr>
    ${card(detailRows([["Datum", date], ["Gäste", guests], ["Bereich", area]]))}
    <tr><td align="center" style="padding:26px 32px 8px;">
      ${button(`${SITE}/#menu-section`, "Speisekarte ansehen")}
    </td></tr>
    <tr><td align="center" style="padding:18px 32px 28px;">
      <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};padding-bottom:8px;">Öffnungszeiten</div>
      <div style="font-family:${SERIF};font-size:15px;line-height:24px;color:${C.ink};">
        Di – Sa · 09:30 – 18:00 Uhr<br>Sonn- &amp; Feiertage · 10:00 – 18:00 Uhr<br>
        <span style="color:${C.muted};">Montag Ruhetag</span>
      </div>
      <p style="margin:20px 0 0;font-family:${SERIF};font-style:italic;font-size:16px;color:${C.roseDeep};">Ihr MainBar Team</p>
    </td></tr>`
  );

  const text = [
    "Vielen Dank für Ihre Anfrage bei MainBar!",
    "",
    `Datum: ${formatGermanDate(b.date)}`,
    `Gäste: ${guests}`,
    `Bereich: ${area}`,
    "",
    "Wir prüfen die Verfügbarkeit und melden uns in Kürze persönlich bei Ihnen.",
    "",
    "Öffnungszeiten: Di–Sa 09:30–18:00 Uhr, Sonn- & Feiertage 10:00–18:00 Uhr, Montag Ruhetag",
    "",
    "Ihr MainBar Team",
    "MainBar drinks & food · Spitalstraße 19 · 97421 Schweinfurt · +49 170 2278096",
    `${SITE}`,
  ].join("\n");

  return { subject: "Ihre Anfrage bei MainBar ist eingegangen", html, text };
}

/* ------------------------------------------------------------------ */
/*  Owner alert                                                         */
/* ------------------------------------------------------------------ */

export function ownerAlert(b: BookingMailData) {
  const date = escapeHtml(formatGermanDate(b.date));
  const guests = guestsLabel(b.guests);
  const area = SEATING[b.seating];
  const phone = escapeHtml(b.phone);
  const email = escapeHtml(b.email);
  const place = `${escapeHtml(b.city)}, ${escapeHtml(b.state)}`;
  const tel = b.phone.replace(/[^\d+]/g, "");

  const html = layout(
    `${guests} · ${date} · ${area}`,
    `<tr><td align="center" style="padding:28px 32px 8px;">
      <div style="font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.roseDeep};">Neue Anfrage über die Website</div>
      <h1 style="margin:14px 0 18px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:36px;color:${C.ink};">${guests} am ${date}</h1>
    </td></tr>
    ${card(
      detailRows([
        ["Datum", date],
        ["Gäste", guests],
        ["Bereich", area],
        ["Ort", place],
        ["Telefon", `<a href="tel:${escapeHtml(tel)}" style="color:${C.ink};text-decoration:none;">${phone}</a>`],
        ["E-Mail", `<a href="mailto:${email}" style="color:${C.ink};text-decoration:none;">${email}</a>`],
      ])
    )}
    <tr><td align="center" style="padding:26px 24px 30px;">
      ${tel ? button(`tel:${escapeHtml(tel)}`, "Anrufen") : ""}
      ${button(`mailto:${email}`, "Antworten", false)}
      ${button(`${SITE}/admin`, "Im Admin öffnen", false)}
      <p style="margin:16px 0 0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};">
        Tipp: „Antworten“ in Ihrem Mailprogramm schreibt direkt an den Gast.
      </p>
    </td></tr>`
  );

  const text = [
    "Neue Event-/Catering-Anfrage über die Website",
    "",
    `Datum: ${formatGermanDate(b.date)}`,
    `Gäste: ${guests}`,
    `Bereich: ${area}`,
    `Ort: ${b.city}, ${b.state}`,
    `Telefon: ${b.phone}`,
    `E-Mail: ${b.email}`,
    "",
    `Admin: ${SITE}/admin`,
  ].join("\n");

  return {
    subject: `Neue Anfrage: ${guests} am ${formatGermanDate(b.date)}`,
    html,
    text,
  };
}
