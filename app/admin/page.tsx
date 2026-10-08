"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const menuCategories = [
  "FRÜHSTÜCK",
  "GESCHMACKSSACHEN",
  "WINZERFLADEN",
  "HEISSGETRÄNKE",
  "ALKOHOLFREI",
  "APERITIF & BIER",
  "WEINE & LONGDRINKS",
];

type SizeOption = {
  label: string;
  price: string;
};

type Booking = {
  id: string;
  date?: string;
  email?: string;
  phone?: string;
  city?: string;
  status?: string;
};

type MenuItem = {
  id: string;
  category?: string;
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  isExtra?: boolean | string;
  sizes?: SizeOption[];
};

const getErrorInfo = (err: unknown) => {
  const e = err as { code?: string; message?: string };
  return { code: e?.code, message: e?.message };
};

export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("bookings");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({
    category: menuCategories[0],
    name: "",
    description: "",
    price: "",
    image_url: "",
    isExtra: false,
    sizes: [] as SizeOption[],
  });

  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Live data
  useEffect(() => {
    if (!user) return;

    const qBookings = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );
    const unsubBookings = onSnapshot(qBookings, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
    });

    const qMenu = query(collection(db, "menu"));
    const unsubMenu = onSnapshot(qMenu, (snap) => {
      setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem));
    });

    return () => {
      unsubBookings();
      unsubMenu();
    };
  }, [user]);

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // ---------- AUTH ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const { code, message } = getErrorInfo(err);
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        setError("Falsche E-Mail oder Passwort.");
      } else {
        setError(`Fehler: ${message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
  };

  // ---------- BOOKINGS ----------
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren des Status.");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const activeBookings = bookings.filter((b) => !b.date || b.date >= todayStr);
  const oldBookings = bookings.filter((b) => b.date && b.date < todayStr);

  // ---------- MENU ----------
  const resetMenuForm = () => {
    setMenuForm({
      category: menuCategories[0],
      name: "",
      description: "",
      price: "",
      image_url: "",
      isExtra: false,
      sizes: [],
    });
    setEditingId(null);
    setIsMenuModalOpen(false);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanedSizes = menuForm.sizes.filter(
        (s) => s.label.trim() && s.price.trim()
      );

      const payload = {
        ...menuForm,
        sizes: cleanedSizes.length > 0 ? cleanedSizes : null,
      };

      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), payload);
      } else {
        await addDoc(collection(db, "menu"), payload);
      }
      resetMenuForm();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setMenuForm({
      category: item.category || menuCategories[0],
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      image_url: item.image_url || "",
      isExtra: !!item.isExtra,
      sizes: item.sizes || [],
    });
    setEditingId(item.id);
    setIsMenuModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Wirklich löschen?")) {
      await deleteDoc(doc(db, "menu", id));
    }
  };

  // Size helpers
  const addSizeRow = () => {
    setMenuForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { label: "", price: "" }],
    }));
  };

  const updateSizeRow = (
    index: number,
    field: "label" | "price",
    value: string
  ) => {
    setMenuForm((prev) => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  const removeSizeRow = (index: number) => {
    setMenuForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  // ---------- BULK REPLACE ----------
  const handleBulkReplaceMenu = async () => {
    if (
      !confirm(
        "ACHTUNG!\n\nAlle bestehenden Menü-Einträge werden gelöscht und durch das neue Menü ersetzt.\n\nWirklich fortfahren?"
      )
    )
      return;

    setIsBulkImporting(true);
    setBulkProgress("Lösche alte Einträge...");

    try {
      const snapshot = await getDocs(collection(db, "menu"));
      await Promise.all(
        snapshot.docs.map((d) => deleteDoc(doc(db, "menu", d.id)))
      );

      setBulkProgress(
        `Alte Einträge gelöscht (${snapshot.size}). Füge neue hinzu...`
      );

      setBulkProgress("");
      alert(`Erfolgreich!`);
    } catch (err) {
      console.error(err);
      alert("Fehler: " + (getErrorInfo(err).message || "Unbekannt"));
    } finally {
      setIsBulkImporting(false);
      setBulkProgress("");
    }
  };

  // ---------- RENDER ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="w-8 h-8 border-4 border-[#cda1b1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#353941] p-6 relative">
        <Link
          href="/"
          className="absolute top-8 left-6 text-[#a0a0a0] hover:text-[#cda1b1] text-xs font-bold tracking-widest uppercase"
        >
          ← Zurück zur Webseite
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-(family-name:--font-script)-5xl text-[#cda1b1] mb-2">
              MainBar
            </h1>
            <h2 className="text-[#a0a0a0] uppercase tracking-widest text-xs font-bold">
              Admin Portal
            </h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2 block">
                E-Mail
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-200 py-2.5 focus:outline-none focus:border-[#cda1b1]"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2 block">
                Passwort
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-200 py-2.5 focus:outline-none focus:border-[#cda1b1]"
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-4 rounded-full font-semibold uppercase tracking-widest text-xs"
            >
              {isLoggingIn ? "Wird geladen..." : "Einloggen"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row">
      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-(family-name:--font-script) text-2xl text-[#cda1b1]">
            MainBar
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-widest text-red-400"
        >
          Ausloggen
        </button>
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col md:hidden"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h1 className="font-(family-name:--font-script) text-3xl text-[#cda1b1]">
                  MainBar
                </h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl">
                  ×
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                <button
                  onClick={() => selectTab("bookings")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    activeTab === "bookings" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0]"
                  }`}
                >
                  📅 Event Anfragen ({activeBookings.length})
                </button>
                <button
                  onClick={() => selectTab("old_bookings")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    activeTab === "old_bookings" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0]"
                  }`}
                >
                  📁 Vergangene Events ({oldBookings.length})
                </button>
                <button
                  onClick={() => selectTab("menu")}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
                    activeTab === "menu" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0]"
                  }`}
                >
                  🍽️ Menü Manager
                </button>
              </nav>

              <div className="p-4 border-t space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-[#a0a0a0] hover:bg-[#faf8f5] rounded-xl text-sm font-bold"
                >
                  🌐 Zur Webseite
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-50 rounded-xl text-sm font-bold"
                >
                  Ausloggen
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== DESKTOP SIDEBAR — sticky + own scroll, so it stays pinned to
           the viewport regardless of how tall the main content grows ===== */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 md:overflow-y-auto">
        <div className="p-8 border-b">
          <h1 className="font-(family-name:--font-script) text-3xl text-[#cda1b1]">
            MainBar
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => selectTab("bookings")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
              activeTab === "bookings" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0] hover:bg-[#faf8f5]"
            }`}
          >
            📅 Event Anfragen ({activeBookings.length})
          </button>
          <button
            onClick={() => selectTab("old_bookings")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
              activeTab === "old_bookings" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0] hover:bg-[#faf8f5]"
            }`}
          >
            📁 Vergangene Events ({oldBookings.length})
          </button>
          <button
            onClick={() => selectTab("menu")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
              activeTab === "menu" ? "bg-[#faf8f5] text-[#2d2d2d]" : "text-[#a0a0a0] hover:bg-[#faf8f5]"
            }`}
          >
            🍽️ Menü Manager
          </button>
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link
            href="/"
            className="block w-full text-left px-4 py-3 text-[#a0a0a0] hover:bg-[#faf8f5] rounded-xl text-sm font-bold"
          >
            🌐 Zur Webseite
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-50 rounded-xl text-sm font-bold"
          >
            Ausloggen
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT — scrolls independently of the sidebar ===== */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto md:h-screen">
        <header className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2d2d2d]">
            {activeTab === "bookings" && "Aktuelle Event Anfragen"}
            {activeTab === "old_bookings" && "Vergangene Events"}
            {activeTab === "menu" && "Menü Manager"}
          </h2>
          <span className="hidden md:inline text-xs text-[#a0a0a0] bg-white px-4 py-2 rounded-full shadow-sm">
            {user.email}
          </span>
        </header>

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
                Keine aktuellen Anfragen.
              </div>
            ) : (
              activeBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <select
                      value={b.status || "Neu"}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border-0 bg-amber-100 text-amber-700"
                    >
                      <option value="Neu">Neu</option>
                      <option value="Bestätigt">Bestätigt</option>
                      <option value="Storniert">Storniert</option>
                    </select>
                    <span className="text-sm font-bold text-[#cda1b1]">
                      📅 {b.date ? new Date(b.date).toLocaleDateString("de-DE") : "Kein Datum"}
                    </span>
                  </div>
                  <p className="font-bold text-[#2d2d2d]">{b.email}</p>
                  <p className="text-sm text-[#a0a0a0]">📞 {b.phone} · 📍 {b.city}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "old_bookings" && (
          <div className="space-y-4">
            {oldBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
                Keine vergangenen Events.
              </div>
            ) : (
              oldBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 opacity-80">
                  <p className="font-bold text-[#2d2d2d]">{b.email}</p>
                  <p className="text-sm text-[#a0a0a0]">
                    📅 {b.date ? new Date(b.date).toLocaleDateString("de-DE") : "Kein Datum"}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "menu" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
              <p className="text-[#a0a0a0] text-sm">Speisekarte verwalten (inkl. Größen)</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleBulkReplaceMenu}
                  disabled={isBulkImporting}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    isBulkImporting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#2d2d2d] text-white hover:bg-[#cda1b1]"
                  }`}
                >
                  {isBulkImporting ? "Importiere..." : "Komplettes Menü ersetzen"}
                </button>
                <button
                  onClick={() => {
                    resetMenuForm();
                    setIsMenuModalOpen(true);
                  }}
                  className="bg-[#cda1b1] text-[#353941] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#ebd2db]"
                >
                  + Neues Gericht
                </button>
              </div>
            </div>

            {bulkProgress && (
              <div className="mb-6 bg-[#cda1b1]/10 border border-[#cda1b1]/30 rounded-2xl px-5 py-3 text-sm">
                {bulkProgress}
              </div>
            )}

            {menuItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
                Noch keine Gerichte vorhanden.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        {item.isExtra && (
                          <span className="text-[10px] font-bold uppercase bg-[#cda1b1] text-white px-2 py-0.5 rounded">
                            Extra
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg text-[#2d2d2d]">{item.name}</h4>
                      <p className="text-xs text-[#a0a0a0] line-clamp-1">
                        {item.description || "Keine Beschreibung"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#cda1b1]">€ {item.price}</span>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-blue-500 text-sm font-medium"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="text-red-500 text-sm font-medium"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {isMenuModalOpen && (
            <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto relative shadow-2xl"
              >
                <button
                  onClick={resetMenuForm}
                  className="absolute top-5 right-5 text-2xl text-gray-400 hover:text-black"
                >
                  ×
                </button>

                <h3 className="font-serif text-xl mb-6 pr-8">
                  {editingId ? "Gericht bearbeiten" : "Neues Gericht hinzufügen"}
                </h3>

                <form onSubmit={handleMenuSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="menu-category" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                      Kategorie
                    </label>
                    <select
                      id="menu-category"
                      value={menuForm.category}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, category: e.target.value })
                      }
                      className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                    >
                      {menuCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="menu-name" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                      Name
                    </label>
                    <input
                      id="menu-name"
                      required
                      value={menuForm.name}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, name: e.target.value })
                      }
                      className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                      placeholder="z.B. Cafe Crema"
                    />
                  </div>

                  <div>
                    <label htmlFor="menu-price" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                      Hauptpreis (€)
                    </label>
                    <input
                      id="menu-price"
                      required
                      value={menuForm.price}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, price: e.target.value })
                      }
                      className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                      placeholder="z.B. 3,50"
                    />
                  </div>

                  <div>
                    <label htmlFor="menu-description" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                      Beschreibung
                    </label>
                    <textarea
                      id="menu-description"
                      rows={2}
                      value={menuForm.description}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, description: e.target.value })
                      }
                      className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] resize-none"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">
                        Größen / Varianten
                      </label>
                      <button
                        type="button"
                        onClick={addSizeRow}
                        className="text-xs font-bold text-[#cda1b1]"
                      >
                        + Größe hinzufügen
                      </button>
                    </div>

                    {menuForm.sizes.length === 0 && (
                      <p className="text-xs text-gray-400">Keine Größen – nur Hauptpreis wird verwendet</p>
                    )}

                    {menuForm.sizes.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-2 items-center">
                        <input
                          placeholder="Label (Normal / 0,25 l)"
                          value={s.label}
                          onChange={(e) => updateSizeRow(i, "label", e.target.value)}
                          className="flex-1 border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-[#cda1b1]"
                        />
                        <input
                          placeholder="Preis"
                          value={s.price}
                          onChange={(e) => updateSizeRow(i, "price", e.target.value)}
                          className="w-20 border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-[#cda1b1]"
                        />
                        <button
                          type="button"
                          onClick={() => removeSizeRow(i)}
                          className="text-red-400 text-lg font-bold px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isExtra"
                      checked={menuForm.isExtra}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, isExtra: e.target.checked })
                      }
                      className="w-5 h-5 accent-[#cda1b1]"
                    />
                    <label htmlFor="isExtra" className="text-xs font-bold uppercase tracking-widest">
                      Als Extra markieren
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-4 rounded-full font-bold uppercase tracking-widest text-xs"
                  >
                    {editingId ? "Änderungen speichern" : "Gericht hinzufügen"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}