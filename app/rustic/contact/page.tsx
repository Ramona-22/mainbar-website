"use client";

import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useCookieConsent } from '../../context/CookieConsentContext';
import { useState } from 'react';

export default function RusticContact() {
  const { lang } = useLanguage();
  const { consent } = useCookieConsent();
  const [mapRequested, setMapRequested] = useState(false);
  const showMap = mapRequested || !!consent?.functional;

  const t = {
    title: lang === 'de' ? 'Komm Vorbei' : 'Visit Us',
    subtitle: lang === 'de' ? 'Wir freuen uns auf dich' : 'We look forward to seeing you',
    back: lang === 'de' ? 'Zur Startseite' : 'Back Home',
    address: lang === 'de' ? 'Adresse' : 'Address',
    hours: lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours',
    contact: lang === 'de' ? 'Kontakt' : 'Contact',
    hoursText: lang === 'de' ? 'Dienstag - Samstag: 09:30 - 13:00 Uhr' : 'Tuesday - Saturday: 9:30 AM - 1:00 PM',
    closed: lang === 'de' ? 'Sonntag & Montag: Ruhetag' : 'Sunday & Monday: Closed'
  };

  return (
    <main className="min-h-screen bg-[#F9F6F0] text-[#5C4033] p-6 md:p-12 font-serif relative">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 pb-6 border-b border-[#E8E0D5]">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-5xl font-medium tracking-wide text-[#4A332A]">{t.title}</h1>
            <p className="text-sm text-[#C07F67] uppercase tracking-widest mt-2">{t.subtitle}</p>
          </div>
          <Link href="/rustic" className="text-sm uppercase tracking-widest text-[#C07F67] border-2 border-[#C07F67] rounded-full px-6 py-2 hover:bg-[#C07F67] hover:text-[#F9F6F0] transition-colors font-sans font-semibold">
            &larr; {t.back}
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Info Cards */}
          <div className="space-y-10 bg-white p-10 rounded-3xl shadow-sm border border-[#E8E0D5]">
            
            {/* Address */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#C07F67] mb-4 border-b border-[#E8E0D5] pb-2 inline-block font-sans">
                {t.address}
              </h2>
              <p className="text-xl text-[#4A332A] leading-relaxed">
                MainBar<br />
                Spitalstrasse 19<br />
                97421 Schweinfurt
              </p>
            </div>

            {/* Hours */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#C07F67] mb-4 border-b border-[#E8E0D5] pb-2 inline-block font-sans">
                {t.hours}
              </h2>
              <p className="text-xl text-[#4A332A] leading-relaxed">
                {t.hoursText}<br />
                <span className="text-[#7D6B5D] text-base italic">{t.closed}</span>
              </p>
            </div>

            {/* Phone */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#C07F67] mb-4 border-b border-[#E8E0D5] pb-2 inline-block font-sans">
                {t.contact}
              </h2>
              <p className="text-xl text-[#4A332A] leading-relaxed">
                <a href="tel:+491702278096" className="hover:text-[#C07F67] transition-colors">+49 170 2278096</a>
              </p>
            </div>
            
          </div>

          {/* Perfectly Pinned Google Map Embed */}
          <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden shadow-md border border-[#E8E0D5] bg-white">
             {showMap ? (
             <iframe 
               title="MainBar Location Map"
               src="https://maps.google.com/maps?q=Spitalstrasse%2019,%2097421%20Schweinfurt&t=&z=16&ie=UTF8&iwloc=&output=embed"
               width="100%" 
               height="100%" 
               style={{ border: 0, minHeight: '420px' }} 
               allowFullScreen={false} 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
             ></iframe>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#F9F6F0]">
                 <p className="text-lg text-[#5C4033] mb-2">Karte wird nicht angezeigt</p>
                 <p className="text-sm text-[#5C4033/70] mb-4 max-w-xs">
                   Für die Anzeige von Google Maps benötigen wir Ihre Einwilligung in funktionale Cookies.
                 </p>
                 <button
                   onClick={() => setMapRequested(true)}
                   className="text-[#C07F67] font-bold uppercase tracking-widest text-xs border-b border-transparent hover:border-[#C07F67] transition-colors"
                 >
                   Karte laden &amp; Einwilligen
                 </button>
                 <p className="text-xs text-[#5C4033/70] mt-4 max-w-xs">
                   Dabei werden Daten an Google übermittelt. Mehr in der <a href="/datenschutz" className="underline">Datenschutzerklärung</a>.
                 </p>
               </div>
             )}
          </div>
          
        </div>
      </div>
    </main>
  );
}