import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  where,
  limit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getErrorInfo } from "./helpers";
import type { Booking, MenuItem, Review } from "./types";

// Live Firestore lists for the dashboard (bookings, menu, reviews).
export function useAdminData(user: User | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Set when Firestore refuses access (signed in, but not an admin) or a
  // live list fails to load, so the dashboard never looks silently empty.
  const [accessDenied, setAccessDenied] = useState(false);
  const [dataError, setDataError] = useState("");

  // Do not keep customer data in memory after logout.
  const clearData = useCallback(() => {
    setBookings([]);
    setMenuItems([]);
    setReviews([]);
    setAccessDenied(false);
    setDataError("");
  }, []);

  useEffect(() => {
    if (!user) return;

    const onListenError = (label: string) => (err: unknown) => {
      console.error(`[admin] ${label} listener failed:`, err);
      if (getErrorInfo(err).code === "permission-denied") {
        setAccessDenied(true);
      } else {
        setDataError(
          `${label} konnten nicht geladen werden. Bitte die Seite neu laden.`
        );
      }
    };

    const qBookings = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );
    const unsubBookings = onSnapshot(
      qBookings,
      (snap) => {
        setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
      },
      onListenError("Anfragen")
    );

    const qMenu = query(collection(db, "menu"));
    const unsubMenu = onSnapshot(
      qMenu,
      (snap) => {
        setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem));
      },
      onListenError("Menü")
    );

    const qReviews = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubReviews = onSnapshot(
      qReviews,
      (snap) => {
        setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review));
      },
      onListenError("Bewertungen")
    );

    return () => {
      unsubBookings();
      unsubMenu();
      unsubReviews();
    };
  }, [user]);

  // Delete cookie-consent records older than three years (Datenschutz §9).
  // Runs once per admin login; replaces a Firestore TTL policy, which needs
  // a paid Firebase plan. Failures are harmless and retried next login.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const expired = await getDocs(
          query(collection(db, "cookieConsents"), where("expireAt", "<", Timestamp.now()), limit(400))
        );
        if (expired.empty) return;
        const batch = writeBatch(db);
        expired.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.warn("[admin] cookie-consent cleanup skipped:", err);
      }
    })();
  }, [user]);

  return { bookings, menuItems, reviews, accessDenied, dataError, clearData };
}
