import { updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// ---------- BOOKINGS ----------
export const updateBookingStatus = async (id: string, status: string) => {
  try {
    await updateDoc(doc(db, "bookings", id), { status });
  } catch (err) {
    console.error(err);
    alert("Fehler beim Aktualisieren des Status.");
  }
};

// Used for spam cleanup and GDPR deletion requests (Art. 17 DSGVO).
export const deleteBooking = async (id: string) => {
  if (!window.confirm("Diese Anfrage endgültig löschen?")) return;
  try {
    await deleteDoc(doc(db, "bookings", id));
  } catch (err) {
    console.error(err);
    alert("Fehler beim Löschen.");
  }
};

// ---------- REVIEWS ----------
export const setReviewApproved = async (id: string, approved: boolean) => {
  try {
    await updateDoc(doc(db, "reviews", id), { approved });
  } catch (err) {
    console.error(err);
    alert("Fehler beim Aktualisieren der Bewertung.");
  }
};

export const deleteReview = async (id: string) => {
  if (!window.confirm("Diese Bewertung endgültig löschen?")) return;
  try {
    await deleteDoc(doc(db, "reviews", id));
  } catch (err) {
    console.error(err);
    alert("Fehler beim Löschen.");
  }
};

// ---------- MENU ----------
// Saves the position of every item in one list (one homepage tab), in the
// given order. Returns false on failure so the list can snap back.
export const saveMenuOrder = async (ids: string[]): Promise<boolean> => {
  try {
    const batch = writeBatch(db);
    ids.forEach((id, index) => batch.update(doc(db, "menu", id), { order: index }));
    await batch.commit();
    return true;
  } catch (err) {
    console.error(err);
    alert("Reihenfolge konnte nicht gespeichert werden.");
    return false;
  }
};

export const deleteMenuItem = async (id: string) => {
  if (!window.confirm("Wirklich löschen?")) return;
  try {
    await deleteDoc(doc(db, "menu", id));
  } catch (err) {
    console.error(err);
    alert("Fehler beim Löschen.");
  }
};
