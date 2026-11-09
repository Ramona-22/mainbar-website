import { describe, expect, it } from "vitest";
import { localizeMenuItem, menuItemsEn, menuTabLabelsEn, sizeLabelEn } from "./menuTranslations";

const cappuccino = {
  name: "Tasse Tee",
  description: "Verschiedene Sorten von MEE TEE",
  sizes: [
    { label: "Normal", price: "3,90" },
    { label: "Groß", price: "5,40" },
  ],
};

describe("localizeMenuItem", () => {
  it("returns German items unchanged", () => {
    expect(localizeMenuItem(cappuccino, "de")).toBe(cappuccino);
  });

  it("translates name, description and sizes into English without mutating", () => {
    const en = localizeMenuItem(cappuccino, "en");
    expect(en.name).toBe("Cup of Tea");
    expect(en.description).toBe(menuItemsEn["Tasse Tee"].description);
    expect(en.sizes?.map((s) => s.label)).toEqual(["Regular", "Large"]);
    expect(cappuccino.name).toBe("Tasse Tee");
    expect(cappuccino.sizes[1].label).toBe("Groß");
  });

  it("prefers the English fields entered in /admin", () => {
    const en = localizeMenuItem({ ...cappuccino, name_en: "Tea of the Day", description_en: "Ask us" }, "en");
    expect(en.name).toBe("Tea of the Day");
    expect(en.description).toBe("Ask us");
  });

  it("falls back to German for unknown items", () => {
    const item = { name: "Neues Gericht", description: "Etwas Feines" };
    expect(localizeMenuItem(item, "en")).toEqual(item);
  });
});

describe("sizeLabelEn", () => {
  it("translates labels and volumes", () => {
    expect(sizeLabelEn("Doppelter")).toBe("Double");
    expect(sizeLabelEn("0,25 l")).toBe("0.25 l");
    expect(sizeLabelEn("mit frisch gepresstem O-Saft 0,25 l")).toBe(
      "with freshly squeezed orange juice 0.25 l"
    );
    expect(sizeLabelEn("Spezial")).toBe("Spezial");
  });
});

describe("menuTabLabelsEn", () => {
  it("covers every menu tab", () => {
    expect(Object.keys(menuTabLabelsEn)).toHaveLength(8);
    expect(menuTabLabelsEn["SELBSTGEBACKENES"]).toBe("HOMEMADE BAKES");
  });
});
