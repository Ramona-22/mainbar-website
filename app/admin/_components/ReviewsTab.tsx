import { deleteReview, setReviewApproved } from "../_lib/actions";
import type { Review } from "../_lib/types";

export default function ReviewsTab({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
          Noch keine Bewertungen.
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {r.approved ? "Öffentlich" : "Wartet auf Freigabe"}
              </span>
              <span className="font-bold text-[#2d2d2d]">{r.author || "Anonym"}</span>
              <span className="text-sm text-[#cda1b1]" aria-label={`${r.rating ?? 0} von 5 Sternen`}>
                {"★".repeat(Math.max(0, Math.min(5, Number(r.rating) || 0)))}
              </span>
              {r.createdAt && (
                <span className="text-xs text-[#a0a0a0]">
                  {(typeof r.createdAt === "string"
                    ? new Date(r.createdAt)
                    : r.createdAt.toDate()
                  ).toLocaleDateString("de-DE")}
                </span>
              )}
            </div>
            <p className="text-sm text-[#555] whitespace-pre-line">{r.text}</p>
            <button
              onClick={() => setReviewApproved(r.id, !r.approved)}
              className="mt-3 mr-6 text-green-700 text-xs font-bold uppercase tracking-widest"
            >
              {r.approved ? "Verbergen" : "Freigeben"}
            </button>
            <button
              onClick={() => deleteReview(r.id)}
              className="mt-3 text-red-500 text-xs font-bold uppercase tracking-widest"
            >
              Löschen
            </button>
          </div>
        ))
      )}
    </div>
  );
}
