import { deleteBooking, updateBookingStatus } from "../_lib/actions";
import { formatBookingDate } from "../_lib/helpers";
import { normalizeStatus, SEATING_LABELS, type Booking } from "../_lib/types";

// Upcoming (and undated) event requests.
export function BookingsTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
          Keine aktuellen Anfragen.
        </div>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex flex-wrap gap-3 mb-3">
              <select
                aria-label="Status"
                value={normalizeStatus(b.status)}
                onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border-0 bg-amber-100 text-amber-700"
              >
                <option value="Neu">Neu</option>
                <option value="Bestätigt">Bestätigt</option>
                <option value="Storniert">Storniert</option>
              </select>
              <span className="text-sm font-bold text-[#cda1b1]">
                📅 {formatBookingDate(b.date)}
              </span>
            </div>
            <p className="font-bold text-[#2d2d2d]">{b.email}</p>
            <p className="text-sm text-[#a0a0a0]">
              👥 {b.guests ?? "?"} Personen · {SEATING_LABELS[b.seating ?? ""] ?? b.seating ?? "–"}
            </p>
            <p className="text-sm text-[#a0a0a0]">
              📞 {b.phone} · 📍 {[b.city, b.state].filter(Boolean).join(", ")}
            </p>
            <button
              onClick={() => deleteBooking(b.id)}
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

// Events whose date has passed.
export function OldBookingsTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
          Keine vergangenen Events.
        </div>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 opacity-80">
            <p className="font-bold text-[#2d2d2d]">{b.email}</p>
            <p className="text-sm text-[#a0a0a0]">
              📅 {formatBookingDate(b.date)}
            </p>
            <button
              onClick={() => deleteBooking(b.id)}
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
