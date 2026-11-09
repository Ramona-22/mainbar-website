import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminTab } from "../_lib/types";

type NavProps = {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  activeBookingsCount: number;
  oldBookingsCount: number;
  pendingReviewsCount: number;
};

// The four tab buttons. `inactiveClass` differs between drawer and sidebar.
function TabButtons({
  activeTab,
  onSelectTab,
  activeBookingsCount,
  oldBookingsCount,
  pendingReviewsCount,
  inactiveClass,
}: NavProps & { inactiveClass: string }) {
  const tabClass = (tab: AdminTab) =>
    `w-full text-left px-4 py-3 rounded-xl text-sm font-bold ${
      activeTab === tab ? "bg-[#faf8f5] text-[#2d2d2d]" : inactiveClass
    }`;

  return (
    <>
      <button onClick={() => onSelectTab("bookings")} className={tabClass("bookings")}>
        📅 Event Anfragen ({activeBookingsCount})
      </button>
      <button onClick={() => onSelectTab("old_bookings")} className={tabClass("old_bookings")}>
        📁 Vergangene Events ({oldBookingsCount})
      </button>
      <button onClick={() => onSelectTab("menu")} className={tabClass("menu")}>
        🍽️ Menü Manager
      </button>
      <button onClick={() => onSelectTab("reviews")} className={tabClass("reviews")}>
        ⭐ Bewertungen ({pendingReviewsCount} neu)
      </button>
    </>
  );
}

// Mobile top bar, mobile drawer and desktop sidebar.
export default function AdminNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onLogout,
  ...navProps
}: NavProps & {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* ===== MOBILE TOP BAR ===== */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2"
            aria-label="Menü öffnen"
            aria-expanded={isMobileMenuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-(family-name:--font-great-vibes) text-2xl text-[#cda1b1]">
            MainBar
          </h1>
        </div>
        <button
          onClick={onLogout}
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
                <h1 className="font-(family-name:--font-great-vibes) text-3xl text-[#cda1b1]">
                  MainBar
                </h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl" aria-label="Menü schließen">
                  ×
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                <TabButtons {...navProps} inactiveClass="text-[#a0a0a0]" />
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
                  onClick={onLogout}
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
          <h1 className="font-(family-name:--font-great-vibes) text-3xl text-[#cda1b1]">
            MainBar
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <TabButtons {...navProps} inactiveClass="text-[#a0a0a0] hover:bg-[#faf8f5]" />
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link
            href="/"
            className="block w-full text-left px-4 py-3 text-[#a0a0a0] hover:bg-[#faf8f5] rounded-xl text-sm font-bold"
          >
            🌐 Zur Webseite
          </Link>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-50 rounded-xl text-sm font-bold"
          >
            Ausloggen
          </button>
        </div>
      </aside>
    </>
  );
}
