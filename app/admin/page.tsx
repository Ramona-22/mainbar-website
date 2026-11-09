"use client";

import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../lib/firebaseAuth";
import { localToday } from "./_lib/helpers";
import type { AdminTab } from "./_lib/types";
import { useAdminData } from "./_lib/useAdminData";
import { useLoginForm } from "./_lib/useLoginForm";
import { useMenuEditor } from "./_lib/useMenuEditor";
import LoginForm from "./_components/LoginForm";
import AccessDenied from "./_components/AccessDenied";
import AdminNav from "./_components/AdminNav";
import { BookingsTab, OldBookingsTab } from "./_components/BookingsTab";
import ReviewsTab from "./_components/ReviewsTab";
import MenuTab from "./_components/MenuTab";
import MenuEditorModal from "./_components/MenuEditorModal";

export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loginForm = useLoginForm();
  const { bookings, menuItems, reviews, accessDenied, dataError, clearData } =
    useAdminData(user);
  const menuEditor = useMenuEditor();
  const { isMenuModalOpen, setIsMenuModalOpen, setEditingId, isSavingMenu } =
    menuEditor;

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        // Do not keep customer data in memory after logout.
        clearData();
      }
    });
    return () => unsub();
  }, [clearData]);

  // Escape closes the menu editor and the mobile drawer.
  useEffect(() => {
    if (!isMenuModalOpen && !isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsMobileMenuOpen(false);
      if (isMenuModalOpen && !isSavingMenu) {
        setIsMenuModalOpen(false);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuModalOpen, isMobileMenuOpen, isSavingMenu, setIsMenuModalOpen, setEditingId]);

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
      alert("Abmelden fehlgeschlagen. Bitte die Seite neu laden.");
    }
  };

  const todayStr = localToday();
  const activeBookings = bookings.filter((b) => !b.date || b.date >= todayStr);
  const oldBookings = bookings.filter((b) => b.date && b.date < todayStr);

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
    return <LoginForm form={loginForm} />;
  }

  // SIGNED IN, BUT NOT AN ADMIN (Firestore rules refused access)
  if (accessDenied) {
    return <AccessDenied email={user.email} onLogout={handleLogout} />;
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col md:flex-row">
      <AdminNav
        activeTab={activeTab}
        onSelectTab={selectTab}
        activeBookingsCount={activeBookings.length}
        oldBookingsCount={oldBookings.length}
        pendingReviewsCount={reviews.filter((r) => !r.approved).length}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />

      {/* ===== MAIN CONTENT — scrolls independently of the sidebar ===== */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto md:h-screen">
        <header className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2d2d2d]">
            {activeTab === "bookings" && "Aktuelle Event Anfragen"}
            {activeTab === "old_bookings" && "Vergangene Events"}
            {activeTab === "menu" && "Menü Manager"}
            {activeTab === "reviews" && "Bewertungen"}
          </h2>
          <span className="hidden md:inline text-xs text-[#a0a0a0] bg-white px-4 py-2 rounded-full shadow-sm">
            {user.email}
          </span>
        </header>

        {dataError && (
          <div role="alert" className="mb-6 bg-red-50 text-red-700 text-sm rounded-2xl px-5 py-4">
            {dataError}
          </div>
        )}

        {activeTab === "bookings" && <BookingsTab bookings={activeBookings} />}

        {activeTab === "old_bookings" && <OldBookingsTab bookings={oldBookings} />}

        {activeTab === "reviews" && <ReviewsTab reviews={reviews} />}

        {activeTab === "menu" && (
          <MenuTab
            menuItems={menuItems}
            onAddNew={menuEditor.openNewItem}
            onEdit={menuEditor.handleEditClick}
          />
        )}

        <MenuEditorModal editor={menuEditor} />
      </main>
    </div>
  );
}
