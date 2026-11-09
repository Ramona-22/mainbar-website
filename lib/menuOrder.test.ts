import { describe, expect, it } from "vitest";
import { compareMenuItems, isExtraItem, type OrderableMenuItem } from "./menuOrder";

const names = (items: OrderableMenuItem[]) => [...items].sort(compareMenuItems).map((i) => i.name);

describe("compareMenuItems", () => {
  it("puts bread dishes before sandwiches in Geschmackssachen", () => {
    const c = "GESCHMACKSSACHEN";
    expect(
      names([
        { name: "Sandwich Pastrami", category: c, price: "15,50" },
        { name: "Avocadomus & Spiegelei", category: c, price: "12,90" },
        { name: "Frischkäse, Avocado & Räucherlachs", category: c, price: "14,90" },
      ])
    ).toEqual(["Frischkäse, Avocado & Räucherlachs", "Avocadomus & Spiegelei", "Sandwich Pastrami"]);
  });

  it("puts wines before longdrinks", () => {
    const c = "WEINE & LONGDRINKS";
    expect(
      names([
        { name: "Negroni", category: c, price: "8,20" },
        { name: "Cabernet Dorsa", category: c, price: "8,50" },
        { name: "Silvaner", category: c, price: "7,20" },
      ])
    ).toEqual(["Silvaner", "Cabernet Dorsa", "Negroni"]);
  });

  it("uses the saved order once items were moved", () => {
    expect(
      names([
        { name: "B", order: 1 },
        { name: "A", order: 0 },
        { name: "C", order: 2 },
      ])
    ).toEqual(["A", "B", "C"]);
  });

  it("adds a new item (timestamp order) after never-reordered items", () => {
    const c = "HEISSGETRÄNKE";
    expect(
      names([
        { name: "Neu", category: c, order: Date.now() },
        { name: "Cappuccino", category: c },
        { name: "Cafe Crema", category: c },
      ])
    ).toEqual(["Cafe Crema", "Cappuccino", "Neu"]);
  });
});

describe("isExtraItem", () => {
  it("accepts true and the string 'true' only", () => {
    expect(isExtraItem(true)).toBe(true);
    expect(isExtraItem("TRUE")).toBe(true);
    expect(isExtraItem("false")).toBe(false);
    expect(isExtraItem(undefined)).toBe(false);
  });
});
