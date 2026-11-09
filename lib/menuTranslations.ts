/*
  English versions of the menu, used by the homepage when the language is English.
  German stays the source: items are keyed by their exact German name. English
  fields the owner enters in /admin (name_en / description_en) win over this
  dictionary; items that appear in neither fall back to German.
*/

/** German tab key -> English tab label. */
export const menuTabLabelsEn: Record<string, string> = {
  "FRÜHSTÜCK": "BREAKFAST",
  "GESCHMACKSSACHEN": "SAVOURY BITES",
  "WINZERFLADEN": "VINTNER'S FLATBREADS",
  "SELBSTGEBACKENES": "HOMEMADE BAKES",
  "HEISSGETRÄNKE": "HOT DRINKS",
  "ALKOHOLFREI": "SOFT DRINKS",
  "APERITIF & BIER": "APERITIF & BEER",
  "WEINE & LONGDRINKS": "WINES & LONG DRINKS",
};

/** Exact German item name -> English name and/or description. */
export const menuItemsEn: Record<string, { name?: string; description?: string }> = {
  // Frühstück
  "Portion selbstgebackenes Brot/Brötchen": { name: "Portion of homemade bread / rolls" },
  "MainBar Rühreier": {
    name: "MainBar Scrambled Eggs",
    description: "3 eggs, greens, butter, homemade bread",
  },
  "Eggs Benedict": {
    description:
      "Homemade bread, rocket, homemade basil pesto, avocado, tomato, two poached eggs, hollandaise sauce. Optional +€1 for smoked salmon or cooked ham.",
  },
  "Das Schweinfurter Markt Frühstück": {
    name: "The Schweinfurt Market Breakfast",
    description:
      "1 boiled egg, hard and soft cheese, fig mustard, fresh avocado mash, home-marinated feta, homemade herb cream cheese, market vegetables, butter & homemade bread / rolls.",
  },
  "Das Rathaus Frühstück": {
    name: "The Town Hall Breakfast",
    description:
      "Buffalo mozzarella & tomato, freshly sliced Parma ham & Italian salami, scrambled eggs with truffle, butter & homemade bread / rolls.",
  },
  "1× gekochtes Ei": { name: "1× boiled egg" },
  "Die MainBar Frühstücksetagere": {
    name: "The MainBar Breakfast Tier",
    description:
      "A wild mix of our breakfast favourites on one tiered stand. From 2 people. Fridays & Saturdays only. On weekdays by pre-order only (at least 1 day ahead).",
  },
  "Portion Lachs & Sahnemeerrettich": { name: "Portion of salmon & creamed horseradish" },
  "Hausgemachtes Granola": {
    name: "Homemade Granola",
    description: "With creamy yoghurt and fresh fruit, topped with agave syrup",
  },
  "Butter | Honig | Frischkäse | Marmelade": { name: "Butter | Honey | Cream cheese | Jam" },
  "Das kleine Spitalstraßenfrühstück": {
    name: "The Little Spitalstraße Breakfast",
    description:
      "Jam or honey, butter, homemade bread / rolls, a small homemade granola with Greek yoghurt & fresh fruit",
  },

  // Geschmackssachen
  "Sandwich Pastrami": {
    name: "Pastrami Sandwich",
    description: "Homemade bread, pastrami, coleslaw, pickles, Old Amsterdam, chilli sauce",
  },
  "Pesto, Parmaschinken & Parmesan": {
    name: "Pesto, Parma Ham & Parmesan",
    description: "Pesto, Parma ham, rocket & Parmesan",
  },
  "Toppe dein Sandwich mit MainBar Pommes": { name: "Top your sandwich with MainBar fries" },
  "Sandwich Hähnchen": {
    name: "Chicken Sandwich",
    description:
      "Homemade white bread, chicken, tomato, cucumber, bacon, lettuce, fried egg, MainBar sauce",
  },
  "Büffelmozzarella & Basilikum-Pesto": {
    name: "Buffalo Mozzarella & Basil Pesto",
    description: "Rocket, homemade basil pesto, buffalo mozzarella, tomato",
  },
  "Geräucherter Schinken & Spiegelei": {
    name: "Smoked Ham & Fried Egg",
    description: "Smoked ham, fried egg & pickle",
  },
  "Frischkäse, Grillgemüse & Parmesan": {
    name: "Cream Cheese, Grilled Vegetables & Parmesan",
    description: "Cream cheese, rocket, tomato, grilled vegetables, Parmesan",
  },
  "Avocadomus & Spiegelei": {
    name: "Avocado Mash & Fried Egg",
    description: "Fresh avocado mash & fried egg, rocket, tomato, homemade basil pesto",
  },
  "Frischkäse, Avocado & Räucherlachs": {
    name: "Cream Cheese, Avocado & Smoked Salmon",
    description: "Cream cheese, fresh avocado & smoked salmon, rocket, tomato",
  },
  "Sandwich Avocado & Bacon": {
    name: "Avocado & Bacon Sandwich",
    description: "Homemade bread, avocado, bacon, rocket, tomato, mozzarella, homemade pesto",
  },
  "Sandwich Avocado & Mozzarella": {
    name: "Avocado & Mozzarella Sandwich",
    description: "Homemade bread, avocado, rocket, tomato, mozzarella, homemade pesto",
  },

  // Winzerfladen
  "Bruschetta": {
    description: "Sour cream – diced tomatoes – garlic – olive oil (vegan option available)",
  },
  "Winzerfladen Klassisch": {
    name: "Vintner's Flatbread Classic",
    description: "Sour cream – red balsamic onions – Franconian farmhouse bacon, grapes",
  },
  "Winzerfladen Mediterran": {
    name: "Vintner's Flatbread Mediterranean",
    description:
      "Sour cream – cherry tomatoes – rocket – Parma ham – homemade pesto – Parmesan",
  },
  "Winzerfladen Meeresbrise": {
    name: "Vintner's Flatbread Sea Breeze",
    description:
      "Dill sour cream, rocket, smoked salmon, avocado, tomato, crème fraîche with dill",
  },
  "Winzerfladen Vegetarisch": {
    name: "Vintner's Flatbread Vegetarian",
    description: "Sour cream – rocket – grilled vegetable pesto – Parmesan (vegan option available)",
  },

  // Heißgetränke
  "Trinkschokolade": { name: "Hot Chocolate" },
  "Filterkaffee Pott": { name: "Mug of Filter Coffee" },
  "Milchkaffee": { name: "Café au Lait" },
  "Aufpreis Hafermilch": { name: "Oat milk (surcharge)" },
  "Tasse Tee": {
    name: "Cup of Tea",
    description:
      "Various MEE TEE blends: Beerenstark (berry), Earl Grey, mint, rooibos orange, chai or green tea",
  },
  "Chai Latte": { description: "Tiger Spice or vanilla" },

  // Alkoholfrei
  "Fritz Kola": { description: "Regular or sugar-free" },
  "Hausgemachte Limonade": {
    name: "Homemade Lemonade",
    description: "Lemon-ginger-mint or raspberry-rosemary",
  },
  "Thomas Henry": { description: "Tonic water, bitter lemon or pink grapefruit" },
  "Rhön Sprudel": { description: "Still or sparkling" },
  "Orangensaft": { name: "Orange Juice", description: "Freshly squeezed" },
  "Saft Schorle": { name: "Juice Spritzer", description: "Apple or blackcurrant" },
  "Orangina": { description: "Red or yellow" },

  // Aperitif & Bier
  "Crodino Spritz": { description: "Alcohol-free – Crodino – soda – orange" },
  "Mainbar Secco": { description: "Dry" },
  "Hefeweizen (auch alkoholfrei)": { name: "Wheat Beer (also alcohol-free)" },
  "Campari Spritz": { description: "Campari – Secco – orange" },
  "Pils, Schlapper Seppel": { name: "Pilsner, Schlapper Seppel" },
  "Helles, Bayreuther": { name: "Lager, Bayreuther" },
  "Belsazar Spritz": { description: "Belsazar Vermouth Rosé – Secco – soda – orange" },
  "Limoncello Spritz": { description: "Limoncello – Secco – lemon" },
  "Aperol Spritz": { description: "Aperol – Secco – orange" },
  "Mainbar Spritz ★": { description: "Homemade lemon-ginger syrup – Secco – lemon" },
  "Bayreuther Alk. frei": { name: "Bayreuther Alcohol-free" },
  "Sarti Spritz": { description: "Sarti (blood orange liqueur) – Secco – bitter lemon" },
  "Naturtrübes Radler": { name: "Cloudy Radler (beer & lemonade)" },

  // Weine & Longdrinks
  "Absolut Vodka": { description: "With Red Bull, bitter lemon or soda" },
  "Espresso Maintini": { description: "Absolut Vodka – Kahlúa coffee liqueur – espresso" },
  "Pinot Grigio": { description: "Dry" },
  "Tanqueray – London Dry": {
    description: "With tonic water · Origin: England · Notes: juniper, lemon, lime",
  },
  "Silvaner": { description: "Dry · Weingut Schmitt, Bergtheim" },
  "Scheurebe": { description: "Medium dry" },
  "Cabernet Dorsa": { description: "Red, dry" },
  "Negroni": { description: "Tanqueray – Campari – Vermouth Rosso" },
};

const sizeLabels: Record<string, string> = {
  "groß": "Large",
  "normal": "Regular",
  "einfach": "Single",
  "doppelt": "Double",
  "doppelter": "Double",
  "ohne espresso": "without espresso",
  "mit espresso shot": "with espresso shot",
  "ohne bacon": "without bacon",
  "mit bacon": "with bacon",
  "ohne o-saft": "without orange juice",
  "ohne prosecco": "without Prosecco",
};

/** Translates a size label; volumes like "0,25 l" become "0.25 l". Unknown labels stay as they are. */
export function sizeLabelEn(label: string): string {
  const trimmed = label.trim();
  const exact = sizeLabels[trimmed.toLowerCase()];
  if (exact) return exact;
  // Decimal comma -> point in volumes ("0,25 l", "mit Prosecco 0,1 l").
  let out = trimmed.replace(/(\d),(\d)/g, "$1.$2");
  out = out
    .replace(/^mit frisch gepresstem O-Saft/i, "with freshly squeezed orange juice")
    .replace(/^mit Prosecco/i, "with Prosecco");
  return out;
}

type Localizable = {
  name?: string;
  description?: string;
  name_en?: string;
  description_en?: string;
  sizes?: { label?: string; price: string | number }[] | null;
};

/** The item as shown in the given language (a copy for English; German is returned as is). */
export function localizeMenuItem<T extends Localizable>(item: T, lang: "de" | "en"): T {
  if (lang === "de") return item;
  const entry = menuItemsEn[(item.name ?? "").trim()];
  return {
    ...item,
    name: item.name_en?.trim() || entry?.name || item.name,
    description: item.description_en?.trim() || entry?.description || item.description,
    sizes: item.sizes
      ? item.sizes.map((s) => ({ ...s, label: s.label ? sizeLabelEn(s.label) : s.label }))
      : item.sizes,
  };
}
