import { expect, test } from "@playwright/test";
import { addDoc, futureDate, listDocs, resetEmulators, returningVisitor } from "./helpers";

test.beforeEach(async () => {
  await resetEmulators();
});

test.describe("Intro", () => {
  test("plays on the first visit, then lets the page through and is remembered", async ({ page }) => {
    await returningVisitor(page, { intro: true });
    await page.goto("/");
    const intro = page.locator(".bean-intro");
    await expect(intro).toBeVisible();
    await expect(page.locator(".bean-intro canvas")).toBeVisible();
    // Runs about 8 s, then removes itself.
    await expect(intro).toHaveCount(0, { timeout: 20_000 });
    expect(await page.evaluate(() => localStorage.getItem("mb-intro-seen"))).toBe("1");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    await expect(page.getByRole("heading", { name: "Café & Bistro" })).toBeVisible();
  });

  test("can be skipped", async ({ page }) => {
    await returningVisitor(page, { intro: true });
    await page.goto("/");
    await page.getByRole("button", { name: /Überspringen/ }).click();
    await expect(page.locator(".bean-intro")).toHaveCount(0, { timeout: 3_000 });
    expect(await page.evaluate(() => localStorage.getItem("mb-intro-seen"))).toBe("1");
  });

  test("does not play for returning visitors or with reduced motion", async ({ page }) => {
    await returningVisitor(page);
    await page.goto("/");
    await expect(page.locator(".bean-intro")).toBeHidden();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => localStorage.removeItem("mb-intro-seen"));
    await page.goto("/impressum");
    await page.goto("/");
    await expect(page.locator(".bean-intro")).toBeHidden();
  });
});

test.describe("Homepage", () => {
  test("hero shows the business line", async ({ page }) => {
    await returningVisitor(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Café & Bistro" })).toBeVisible();
    await expect(page.getByText(/Patisserie/)).toHaveCount(0);
  });

  test("menu tabs show items in the printed-menu order", async ({ page }) => {
    for (const [name, price] of [
      ["Tasse Tee", "4,50"],
      ["Cappuccino", "3,90"],
      ["Cafe Crema", "3,50"],
      ["Flat White", "5,00"],
    ]) {
      await addDoc("menu", { name, price, category: "HEISSGETRÄNKE", isExtra: false });
    }
    await addDoc("menu", { name: "Aufpreis Hafermilch", price: "0,50", category: "HEISSGETRÄNKE", isExtra: true });

    await returningVisitor(page);
    await page.goto("/");
    const menu = page.locator("#menu-section");
    await menu.getByRole("button", { name: "HEISSGETRÄNKE" }).click();
    await expect(menu.locator("h3")).toHaveText(["Cafe Crema", "Cappuccino", "Flat White", "Tasse Tee"]);
    await expect(menu.getByText("Extras")).toBeVisible();
    await expect(menu.getByText("Aufpreis Hafermilch")).toBeVisible();
  });
});

test.describe("Booking", () => {
  async function fillBooking(page: import("@playwright/test").Page) {
    await page.goto("/booking");
    await page.locator("#booking-seating").selectOption("inside");
    await page.locator("#booking-guests").fill("4");
    await page.locator("#booking-date").fill(futureDate());
    await page.locator("#booking-state").fill("Bayern");
    await page.locator("#booking-city").fill("E2E Stadt");
    await page.locator("#booking-phone").fill("0170 0000000");
    await page.locator("#booking-email").fill("gast@example.com");
    await page.locator("#gdprConsent").check();
  }

  test("is saved for the admin even when the email fails", async ({ page }) => {
    await returningVisitor(page);
    // Production case: the mail server fails (500) and the server has no database key.
    await page.route("**/api/booking", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"Failed"}' })
    );
    await fillBooking(page);
    await page.getByRole("button", { name: /Anfrage Senden/i }).click();

    await expect(page.getByRole("heading", { name: "Vielen Dank!" })).toBeVisible();
    // No email was sent, so the page must not tell the guest to check their inbox.
    await expect(page.getByText(/E-Mail-Postfach/)).toHaveCount(0);

    await expect
      .poll(async () => (await listDocs("bookings")).map((b) => b.city))
      .toEqual(["E2E Stadt"]);
    const [booking] = await listDocs("bookings");
    expect(booking).toMatchObject({ guests: 4, status: "Neu", email: "gast@example.com" });
  });

  test("tells the guest to check their inbox when the email went out", async ({ page }) => {
    await returningVisitor(page);
    await page.route("**/api/booking", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"success":true,"stored":false,"emailSent":true}',
      })
    );
    await fillBooking(page);
    await page.getByRole("button", { name: /Anfrage Senden/i }).click();
    await expect(page.getByText(/E-Mail-Postfach/)).toBeVisible();
    await expect.poll(async () => (await listDocs("bookings")).length).toBe(1);
  });

  test("a booking the server rejects is never stored", async ({ page }) => {
    await returningVisitor(page);
    await page.route("**/api/booking", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: '{"error":"Too many"}' })
    );
    await fillBooking(page);
    const alerts: string[] = [];
    page.on("dialog", (d) => {
      alerts.push(d.message());
      void d.dismiss();
    });
    await page.getByRole("button", { name: /Anfrage Senden/i }).click();
    await expect.poll(() => alerts.length).toBeGreaterThan(0);
    expect(alerts[0]).toContain("Problem");
    await expect(page.getByRole("heading", { name: "Vielen Dank!" })).toHaveCount(0);
    expect(await listDocs("bookings")).toEqual([]);
  });
});

test.describe("Cookie notice", () => {
  test("first visit shows it; 'Verstanden' saves the choice locally and as proof", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("mb-intro-seen", "1"));
    await page.goto("/impressum");
    const notice = page.getByRole("dialog", { name: /Cookie/ });
    await expect(notice).toBeVisible();
    await notice.getByRole("button", { name: "Verstanden" }).click();
    await expect(notice).toBeHidden();

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("cookie-consent") ?? "{}"));
    expect(stored).toMatchObject({ necessary: true, version: 4 });
    await expect
      .poll(async () => (await listDocs("cookieConsents")).map((c) => c.consentId))
      .toEqual([stored.consentId]);
  });
});

test.describe("Legal pages", () => {
  test("Impressum has the owner's details and no placeholders", async ({ page }) => {
    await returningVisitor(page);
    await page.goto("/impressum");
    const main = page.locator("main");
    await expect(main).toContainText("Ramona Krines");
    await expect(main).toContainText("MainBar drinks & food (Einzelunternehmen)");
    await expect(main).toContainText("DE357534577");
    await expect(main).toContainText("ramonakrines@gmail.com");
    await expect(main).not.toContainText("[");
  });

  test("Datenschutz names the controller and the intro storage", async ({ page }) => {
    await returningVisitor(page);
    await page.goto("/datenschutz");
    const main = page.locator("main");
    await expect(main).toContainText("Inhaberin: Ramona Krines");
    await expect(main).toContainText("mb-intro-seen");
    await expect(main).not.toContainText("[Vor- und Nachname");
  });
});
