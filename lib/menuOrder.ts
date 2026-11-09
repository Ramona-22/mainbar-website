// Shared menu order for the homepage and the admin menu manager.
//
// Items moved in /admin get a numeric `order` field and are sorted by it.
// Items without one (never reordered yet) come first, in the printed-menu
// order below, then by price (highest first).

export type OrderableMenuItem = {
  name?: string;
  category?: string;
  price?: string | number;
  order?: number;
};

const DEFAULT_ORDER: Record<string, string[]> = {
  "HEISSGETRÄNKE": [
    "Cafe Crema", "Cappuccino", "Espresso", "Espresso Macchiato", "Flat White",
    "Latte Macchiato", "Milchkaffee", "Filterkaffee Pott", "Chai Latte",
    "Trinkschokolade", "Tasse Tee",
  ],
  "WEINE & LONGDRINKS": [
    "Silvaner", "Pinot Grigio", "Scheurebe", "Cabernet Dorsa",
    "Negroni", "Espresso Maintini", "Absolut Vodka", "Tanqueray – London Dry",
  ],
};

export const parsePrice = (price: unknown): number => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const cleaned = String(price).replace(",", ".").replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
};

const defaultRank = (item: OrderableMenuItem): number => {
  const name = (item.name ?? "").trim().toLowerCase();
  // Geschmackssachen: bread dishes first, then sandwiches.
  if (item.category === "GESCHMACKSSACHEN") return name.startsWith("sandwich") ? 1 : 0;
  const order = DEFAULT_ORDER[item.category ?? ""];
  if (!order) return 0;
  const idx = order.findIndex((n) => n.toLowerCase() === name);
  return idx === -1 ? order.length : idx;
};

const hasOrder = (item: OrderableMenuItem) =>
  typeof item.order === "number" && Number.isFinite(item.order);

export const compareMenuItems = (a: OrderableMenuItem, b: OrderableMenuItem): number => {
  const aHas = hasOrder(a);
  const bHas = hasOrder(b);
  if (aHas && bHas) return (a.order as number) - (b.order as number);
  // Only items added or moved after a list's last reorder have an `order`
  // while others don't; they belong at the end.
  if (aHas !== bHas) return aHas ? 1 : -1;
  return defaultRank(a) - defaultRank(b) || parsePrice(b.price) - parsePrice(a.price);
};

export const isExtraItem = (val: unknown) =>
  val === true || String(val).toLowerCase() === "true";
