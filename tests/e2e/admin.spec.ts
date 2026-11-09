import { expect, test, type Page } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  addDoc,
  createAdmin,
  futureDate,
  listDocs,
  resetEmulators,
  returningVisitor,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await createAdmin();
  await returningVisitor(page);
});

async function login(page: Page, password = ADMIN_PASSWORD) {
  await page.goto("/admin");
  await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
  await page.getByLabel("Passwort").fill(password);
  await page.getByRole("button", { name: "Einloggen" }).click();
}

test("wrong password shows a German error without revealing the account", async ({ page }) => {
  await login(page, "falsches-passwort");
  const error = page.getByRole("alert").filter({ hasText: /\S/ });
  await expect(error).toBeVisible();
  await expect(error).not.toContainText(/user-not-found|auth\//);
});

test("forgot password sends a reset link", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("E-Mail").fill(ADMIN_EMAIL);
  await page.getByRole("button", { name: "Passwort vergessen?" }).click();
  await expect(page.getByText(/Link zum Zurücksetzen des Passworts/)).toBeVisible();
});

test("admin sees new bookings", async ({ page }) => {
  await addDoc("bookings", {
    seating: "inside",
    guests: 6,
    date: futureDate(),
    state: "Bayern",
    city: "E2E Stadt",
    phone: "0170 1111111",
    email: "gast@example.com",
    createdAt: new Date(),
    status: "Neu",
  });
  await login(page);
  await expect(page.getByText("E2E Stadt")).toBeVisible();
});

test("menu manager groups by homepage tab and saves a new order", async ({ page }) => {
  for (const name of ["Cafe Crema", "Cappuccino", "Flat White"]) {
    await addDoc("menu", { name, price: "4,00", category: "HEISSGETRÄNKE", isExtra: false });
  }
  await addDoc("menu", { name: "Silvaner", price: "7,20", category: "WEINE & LONGDRINKS", isExtra: false });

  await login(page);
  // On phones the tabs sit behind the hamburger menu.
  const burger = page.getByRole("button", { name: "Menü öffnen" });
  if (await burger.isVisible()) await burger.click();
  await page.getByRole("button", { name: /Menü Manager/ }).locator("visible=true").first().click();

  await page.getByRole("tab", { name: /HEISSGETRÄNKE \(3\)/ }).click();
  await expect(page.locator("h4")).toHaveText(["Cafe Crema", "Cappuccino", "Flat White"]);
  await expect(page.getByText("Silvaner")).toHaveCount(0);

  // Move Cafe Crema down one place.
  await page.getByRole("button", { name: "Nach unten" }).first().click();
  await expect(page.locator("h4")).toHaveText(["Cappuccino", "Cafe Crema", "Flat White"]);

  await expect
    .poll(async () =>
      (await listDocs("menu"))
        .filter((m) => m.category === "HEISSGETRÄNKE")
        .sort((a, b) => Number(a.order) - Number(b.order))
        .map((m) => m.name)
    )
    .toEqual(["Cappuccino", "Cafe Crema", "Flat White"]);

  // The homepage follows the saved order.
  await page.goto("/");
  const menu = page.locator("#menu-section");
  await menu.getByRole("button", { name: "HEISSGETRÄNKE" }).click();
  await expect(menu.locator("h3")).toHaveText(["Cappuccino", "Cafe Crema", "Flat White"]);
});
