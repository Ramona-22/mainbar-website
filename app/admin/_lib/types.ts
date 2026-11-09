export const menuCategories = [
  "FRÜHSTÜCK",
  "GESCHMACKSSACHEN",
  "WINZERFLADEN",
  "HEISSGETRÄNKE",
  "ALKOHOLFREI",
  "APERITIF & BIER",
  "WEINE & LONGDRINKS",
  "SELBSTGEBACKENES",
];

export type SizeOption = {
  label: string;
  price: string;
};

export type Booking = {
  id: string;
  date?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  guests?: number | string;
  seating?: string;
  status?: string;
};

export type Review = {
  id: string;
  author?: string;
  text?: string;
  rating?: number;
  approved?: boolean;
  createdAt?: string | { toDate: () => Date };
};

export const SEATING_LABELS: Record<string, string> = {
  inside: "Innen",
  outside: "Außen",
  catering: "Catering",
};

// Older bookings were saved as "pending"; show them as "Neu".
export const normalizeStatus = (status?: string) =>
  !status || status === "pending" ? "Neu" : status;

export type MenuItem = {
  id: string;
  category?: string;
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  isExtra?: boolean | string;
  sizes?: SizeOption[];
  order?: number;
};

// Shape of the menu editor form.
export type MenuForm = {
  category: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  isExtra: boolean;
  sizes: SizeOption[];
};

export const emptyMenuForm = (): MenuForm => ({
  category: menuCategories[0],
  name: "",
  description: "",
  price: "",
  image_url: "",
  isExtra: false,
  sizes: [],
});

export type AdminTab = "bookings" | "old_bookings" | "menu" | "reviews";
