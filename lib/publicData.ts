// Firestore calls used by the public homepage. The homepage loads this module
// with a dynamic import() after first paint, so the large Firestore SDK does
// not delay the hero from appearing on slow phones.
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

type Doc = Record<string, unknown> & { id: string };

export function subscribeMenu(onData: (items: Doc[]) => void): () => void {
  return onSnapshot(query(collection(db, "menu")), (snapshot) => {
    onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Only reviews approved in /admin are public (enforced by firestore.rules).
export function subscribeApprovedReviews(
  onData: (reviews: Doc[]) => void,
  onError: (error: unknown) => void
): () => void {
  return onSnapshot(
    query(collection(db, "reviews"), where("approved", "==", true), limit(50)),
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function submitReview(review: { author: string; text: string; rating: number }) {
  await addDoc(collection(db, "reviews"), {
    author: review.author,
    text: review.text,
    rating: review.rating,
    approved: false,
    createdAt: serverTimestamp(),
  });
}
