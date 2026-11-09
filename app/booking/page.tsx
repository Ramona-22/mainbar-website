"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase"; 
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const subscribeNoop = () => () => {};

export default function BookingPage() {
  const { L, lang } = useLanguage();
  // State variables needed for the form and loading animations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // False when the booking was saved but the confirmation email could not be sent.
  const [emailSent, setEmailSent] = useState(true);
  const [gdprConsent, setGdprConsent] = useState(false);
  
  // Earliest selectable date (today, local time). Set after mount so the
  // server-rendered HTML and the first client render match.
  const minDate = useSyncExternalStore(
    subscribeNoop,
    () => new Date().toLocaleDateString("sv-SE"),
    () => undefined
  );

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
      alert(L("Bitte stimmen Sie der Datenschutzerklärung zu, um das Formular abzusenden.", "Please accept the privacy policy to send the form."));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const payload = { ...formData, guests: Number(formData.guests) };

      // 1. Server validates, rate-limits and sends the emails first, so
      //    rejected or spammy submissions never reach the database.
      let res: Response | null = null;
      try {
        res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, lang }),
        });
      } catch (networkError) {
        console.error("Booking API unreachable:", networkError);
      }

      // 4xx: the server rejected the input or the rate limit hit, so never store it.
      if (res && res.status >= 400 && res.status < 500) {
        throw new Error(`Booking rejected (${res.status})`);
      }
      const emailed = res?.ok === true;
      const result = (emailed ? await res!.json().catch(() => ({})) : {}) as { stored?: boolean };

      // 2. The server normally stores the booking itself. If it has no database
      //    access (stored: false) or the email failed (5xx), the browser saves
      //    it, so the owner still sees it in /admin and no enquiry is lost.
      if (!result.stored) {
        try {
          await addDoc(collection(db, "bookings"), {
            ...payload,
            status: "Neu",
            createdAt: serverTimestamp(),
          });
        } catch (dbError) {
          // Neither emailed nor saved: the visitor must try again.
          if (!emailed) throw dbError;
          console.error("Booking saved by email only:", dbError);
        }
      }

      setEmailSent(emailed);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting booking: ", error);
      alert(L("Es gab ein Problem bei der Übermittlung. Bitte versuchen Sie es später erneut.", "Your request could not be sent. Please try again later."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-24 flex items-center justify-center relative">
      
      {/* Back Button with Mobile Safe-Area Margin */}
      <Link href="/" className="absolute top-12 md:top-8 left-6 md:left-8 text-[#a0a0a0] hover:text-[#cda1b1] text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors p-2 md:p-0">
        &larr; {L("Zurück", "Back")}
      </Link>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-white p-8 md:p-16 rounded-3xl shadow-xl border border-gray-100"
          >
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl md:text-4xl text-[#2d2d2d] mb-4">{L("Event & Catering", "Events & Catering")}</h1>
              <p className="text-[#a0a0a0] text-sm">{L("Planen Sie Ihr nächstes Event mit uns.", "Plan your next event with us.")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col">
                  <label htmlFor="booking-seating" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Sitzplatz", "Seating")}</label>
                  <select id="booking-seating" name="seating" value={formData.seating} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent cursor-pointer">
                    <option value="inside">{L("Im Café (Inside)", "In the café (inside)")}</option>
                    <option value="outside">{L("Außenbereich (Outside)", "Outdoor area")}</option>
                    <option value="catering">{L("Externes Catering", "External catering")}</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="booking-guests" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Personen (Max 30)", "Guests (max. 30)")}</label>
                  <input id="booking-guests" name="guests" type="number" max="30" min="1" required value={formData.guests} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="booking-date" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Datum", "Date")}</label>
                  <input id="booking-date" name="date" type="date" required min={minDate} value={formData.date} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent cursor-pointer" />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="booking-state" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Bundesland", "State / region")}</label>
                  <input id="booking-state" name="state" type="text" required placeholder={L("Bayern", "Bavaria")} value={formData.state} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="booking-city" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Stadt", "City")}</label>
                  <input id="booking-city" name="city" type="text" required placeholder="Schweinfurt" value={formData.city} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="booking-phone" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("Telefon", "Phone")}</label>
                  <input id="booking-phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="booking-email" className="text-xs uppercase tracking-widest text-[#767676] mb-2">{L("E-Mail", "Email")}</label>
                  <input id="booking-email" name="email" type="email" required value={formData.email} onChange={handleChange} className="border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] bg-transparent" />
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
                <label htmlFor="gdprConsent" className="text-xs text-[#767676] leading-relaxed">
                  {L(
                    <>Ich habe die <a href="/datenschutz" className="text-[#cda1b1] hover:underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung dieser Anfrage zu. (Art. 6 Abs. 1 lit. a DSGVO)</>,
                    <>I have read the <a href="/datenschutz" className="text-[#cda1b1] hover:underline">privacy policy</a> and agree to my data being processed to handle this request. (Art. 6(1)(a) GDPR)</>
                  )}
                </label>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full mt-8 text-white py-4 rounded-full font-semibold uppercase tracking-widest text-xs shadow-lg transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#353941] hover:bg-[#2a2d33]"}`}
              >
                {isSubmitting ? L("Wird gesendet...", "Sending...") : L("Anfrage Senden", "Send request")}
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
            <h2 className="font-serif text-2xl text-[#2d2d2d] mb-4">{L("Vielen Dank!", "Thank you!")}</h2>
            <p className="text-[#a0a0a0] text-sm leading-relaxed mb-8">
              {L("Ihre Anfrage wurde erfolgreich an uns übermittelt.", "Your request has been sent to us.")}
              {emailSent && L(" Bitte überprüfen Sie Ihr E-Mail-Postfach.", " Please check your inbox.")}{" "}
              {L("Wir melden uns in Kürze bei Ihnen.", "We will get back to you shortly.")}
            </p>
            <button onClick={() => setIsSuccess(false)} className="text-[#cda1b1] uppercase tracking-widest text-xs font-bold hover:text-[#353941] transition-colors">
              {L("Neue Anfrage stellen", "Send another request")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}