"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase"; 
import Link from "next/link";
import { useCookieConsent } from "../context/CookieConsentContext";

export default function BookingPage() {
  // State variables needed for the form and loading animations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const { consent: cookieConsent } = useCookieConsent();
  
  const [formData, setFormData] = useState({
    seating: "inside",
    guests: 1,
    date: "",
    state: "",
    city: "",
    phone: "",
    email: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gdprConsent) {
      alert("Bitte stimmen Sie der Datenschutzerklärung zu, um das Formular abzusenden.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1. Save booking to Firestore for Admin Dashboard
      await addDoc(collection(db, "bookings"), {
        ...formData,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // 2. Trigger Emails via local API route (Nodemailer)
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send notification emails");

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting booking: ", error);
      alert("Es gab ein Problem bei der Übermittlung. Bitte versuchen Sie es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-24 flex items-center justify-center relative">
      
      {/* Back Button with Mobile Safe-Area Margin */}
      <Link href="/" className="absolute top-12 md:top-8 left-6 md:left-8 text-[#a0a0a0] hover:text-[#cda1b1] text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors p-2 md:p-0">
        &larr; Zurück
      </Link>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100"
          >
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] mb-4">Event & Catering</h1>
              <p className="text-[#a0a0a0] text-sm">Planen Sie Ihr nächstes Event mit uns.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Sitzplatz</label>
                  <select name="seating" value={formData.seating} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent cursor-pointer">
                    <option value="inside">Im Café (Inside)</option>
                    <option value="outside">Außenbereich (Outside)</option>
                    <option value="catering">Externes Catering</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Personen (Max 30)</label>
                  <input name="guests" type="number" max="30" min="1" required value={formData.guests} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Datum</label>
                  <input name="date" type="date" required value={formData.date} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent cursor-pointer" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Bundesland</label>
                  <input name="state" type="text" required placeholder="Bayern" value={formData.state} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Stadt</label>
                  <input name="city" type="text" required placeholder="Schweinfurt" value={formData.city} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Telefon</label>
                  <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-2">Email</label>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-6">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  required
                  className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                />
                <label htmlFor="gdprConsent" className="text-xs text-[#a0a0a0] leading-relaxed">
                  Ich habe die <a href="/datenschutz" className="text-[#cda1b1] hover:underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage zu. (Art. 6 Abs. 1 lit. a DSGVO)
                </label>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full mt-8 text-white py-4 rounded-full font-semibold uppercase tracking-widest text-xs shadow-lg transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#353941] hover:bg-[#2a2d33]"}`}
              >
                {isSubmitting ? "Wird gesendet..." : "Anfrage Senden"}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-[#e6d0d8] rounded-full flex items-center justify-center mb-6">
              <span className="text-[#cda1b1] text-2xl">✓</span>
            </div>
            <h2 className="font-serif text-2xl text-[#2d2d2d] mb-4">Vielen Dank!</h2>
            <p className="text-[#a0a0a0] text-sm leading-relaxed mb-8">
              Ihre Anfrage wurde erfolgreich an uns übermittelt. Bitte überprüfen Sie Ihr E-Mail-Postfach. Wir melden uns in Kürze bei Ihnen.
            </p>
            <button onClick={() => setIsSuccess(false)} className="text-[#cda1b1] uppercase tracking-widest text-xs font-bold hover:text-[#353941] transition-colors">
              Neue Anfrage stellen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}