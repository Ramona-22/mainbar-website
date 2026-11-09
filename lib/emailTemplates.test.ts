import { describe, expect, it } from "vitest";
import { formatGermanDate, guestConfirmation, ownerAlert, type BookingMailData } from "./emailTemplates";

const booking: BookingMailData = {
  seating: "outside",
  guests: 12,
  date: "2026-12-20",
  state: "Bayern",
  city: "<script>alert(1)</script>Schweinfurt",
  phone: "+49 170 1234567",
  email: "gast@example.com",
};

describe("formatGermanDate", () => {
  it("writes the date out in German", () => {
    expect(formatGermanDate("2026-12-20")).toBe("Sonntag, 20. Dezember 2026");
  });
});

describe("guestConfirmation", () => {
  const mail = guestConfirmation(booking);

  it("shows date, guests and area", () => {
    expect(mail.html).toContain("Sonntag, 20. Dezember 2026");
    expect(mail.html).toContain("12 Personen");
    expect(mail.html).toContain("Außenbereich");
    expect(mail.text).toContain("12 Personen");
  });

  it("never repeats free text the visitor typed", () => {
    for (const field of [booking.city, booking.state, booking.phone]) {
      expect(mail.html).not.toContain(field);
      expect(mail.text).not.toContain(field);
    }
  });
});

describe("ownerAlert", () => {
  const mail = ownerAlert(booking);

  it("escapes visitor input", () => {
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });

  it("has call and reply links", () => {
    expect(mail.html).toContain('href="tel:+491701234567"');
    expect(mail.html).toContain('href="mailto:gast@example.com"');
    expect(mail.subject).toBe("Neue Anfrage: 12 Personen am Sonntag, 20. Dezember 2026");
  });
});
