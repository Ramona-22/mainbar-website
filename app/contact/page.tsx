"use client";

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useState } from 'react';

export default function Contact() {
  const { lang } = useLanguage();
  const { consent } = useCookieConsent();
  const [mapRequested, setMapRequested] = useState(false);
  const showMap = mapRequested || !!consent?.functional;

  const t = {
    back: lang === 'de' ? 'Zur Startseite' : 'Back Home',
    title: lang === 'de' ? 'Kontakt & Anfahrt' : 'Visit Us',
    locTitle: lang === 'de' ? 'Standort & Kontakt' : 'Location & Contact',
    hoursTitle: lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours',
    days: lang === 'de' ? 'Dienstag - Samstag' : 'Tuesday - Saturday',
    closed: lang === 'de' ? 'Montag & Sonntag' : 'Monday & Sunday',
    closedText: lang === 'de' ? 'Geschlossen' : 'Closed',
    note: lang === 'de' ? '*Zeiten basieren auf den Breakfast Club Öffnungszeiten. Für Abendveranstaltungen bitte auf Instagram prüfen.' : '*Times based on Breakfast Club hours. Check Instagram for evening events.',
    socialTitle: lang === 'de' ? 'Soziale Medien' : 'Social Media'
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row font-sans bg-[#fcfbf9]">
      <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-24 text-[#7a6c82]">
        <Link href="/" className="text-sm uppercase tracking-widest text-gray-400 hover:text-[#7a6c82] transition-colors mb-12 inline-block">
          &larr; {t.back}
        </Link>
        <h1 className="text-4xl md:text-6xl font-light tracking-widest mb-12 font-serif">{t.title}</h1>
        <div className="space-y-12">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">{t.locTitle}</h2>
            <p className="text-lg text-gray-700 tracking-wide mb-1">Spitalstrasse 19</p>
            <p className="text-lg text-gray-700 tracking-wide mb-4">97421 Schweinfurt</p>
            <p className="text-lg text-gray-700 tracking-wide mb-1">
              <a href="tel:+491702278096" className="hover:text-[#7a6c82] transition-colors">+49 170 2278096</a>
            </p>
            <p className="text-lg text-gray-700 tracking-wide">
              <a href="mailto:info@mainbar-sw.de" className="hover:text-[#7a6c82] transition-colors">info@mainbar-sw.de</a>
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">{t.hoursTitle}</h2>
            <div className="grid grid-cols-2 gap-4 text-lg text-gray-700 tracking-wide max-w-xs">
              <p>{t.days}</p><p>9:30 - 13:00</p>
              <p>{t.closed}</p><p>{t.closedText}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">{t.note}</p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">{t.socialTitle}</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://www.instagram.com/mainbar_sw/" target="_blank" rel="noopener noreferrer" className="inline-block border border-[#7a6c82] text-[#7a6c82] px-8 py-3 uppercase tracking-[0.2em] font-bold hover:bg-[#7a6c82] hover:text-white transition-colors text-center">Instagram</a>
              <a href="https://www.facebook.com/MainbarSW/" target="_blank" rel="noopener noreferrer" className="inline-block border border-[#7a6c82] text-[#7a6c82] px-8 py-3 uppercase tracking-[0.2em] font-bold hover:bg-[#7a6c82] hover:text-white transition-colors text-center">Facebook</a>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen bg-gray-200 relative">
        {showMap ? (
          <iframe
            src="https://maps.google.com/maps?q=Spitalstrasse%2019,%2097421%20Schweinfurt&t=&z=16&ie=UTF8&iwloc=&output=embed"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MainBar Location"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-lg text-gray-600 mb-2">Karte wird nicht angezeigt</p>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Für die Anzeige von Google Maps benötigen wir Ihre Einwilligung in funktionale Cookies.
            </p>
            <button
              onClick={() => setMapRequested(true)}
              className="text-[#cda1b1] hover:text-[#353941] font-bold uppercase tracking-widest text-xs border-b border-transparent hover:border-[#cda1b1] transition-colors"
            >
              Karte laden & Einwilligen
            </button>
            <p className="text-xs text-gray-400 mt-4 max-w-xs">
              Dabei werden Daten an Google übermittelt. Mehr in der <a href="/datenschutz" className="underline hover:text-[#cda1b1]">Datenschutzerklärung</a>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}