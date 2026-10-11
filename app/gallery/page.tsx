"use client";

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function ModernGallery() {
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  
  const t = {
    title: lang === 'de' ? 'Galerie' : 'Gallery',
    back: lang === 'de' ? 'Zurück' : 'Back Home',
  };

  const images = [
    "/media/mainbar-photo-1.jpg", 
    "/media/mainbar-photo-2.jpg", 
    "/media/mainbar-photo-3.jpg", 
    "/media/mainbar-photo-4.jpg", 
    "/media/mainbar-photo-5.jpg", 
    "/media/mainbar-photo-6.jpg", 
    "/media/mainbar-photo-7.jpg", 
    "/media/mainbar-photo-8.jpg", 
    "/media/mainbar-photo-9.jpg", 
  ];

  const openLightbox = (index: number) => setCurrentIndex(index);
  const closeLightbox = () => setCurrentIndex(null);
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); if (currentIndex !== null) setCurrentIndex((currentIndex + 1) % images.length); };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); if (currentIndex !== null) setCurrentIndex((currentIndex - 1 + images.length) % images.length); };

  return (
    <main className="min-h-screen relative font-sans p-6 md:p-12 overflow-hidden bg-[#fcfbf9] text-[#7a6c82] pb-24">
      
      {/* Massive subtle background text in Slate Purple */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none -rotate-12 -z-10 w-[150vw] text-center text-[#7a6c82]"
        style={{ fontFamily: "var(--font-great-vibes), cursive", fontSize: 'clamp(20rem, 40vw, 50rem)', whiteSpace: 'nowrap' }}
      >
        MainBar
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section - Fixed colors so they are perfectly visible */}
        <div className="flex justify-between items-center mb-12 border-b border-[#7a6c82]/30 pb-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase font-serif text-[#7a6c82] drop-shadow-sm">{t.title}</h1>
          <Link href="/" className="text-xs md:text-sm tracking-widest uppercase text-[#7a6c82] border-2 border-[#7a6c82] px-4 py-2 md:px-6 md:py-3 hover:bg-[#7a6c82] hover:text-[#fcfbf9] transition-colors font-bold">
            {t.back}
          </Link>
        </div>
        
        {/* True Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((src, idx) => (
            <div 
              key={idx} 
              onClick={() => openLightbox(idx)}
              className="group relative overflow-hidden shadow-xl cursor-pointer break-inside-avoid"
            >
              <img src={src} alt={`MainBar Modern Gallery ${idx + 1}`} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#3a3340] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Overlay (Kept dark for great contrast when viewing images) */}
      {currentIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-[#2a2530]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-6 right-8 text-[#fcfbf9] text-4xl hover:text-gray-400 transition-colors">&times;</button>
          <button onClick={prevImage} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-[#fcfbf9] text-5xl md:text-7xl hover:text-gray-400 p-4 transition-colors">&#8249;</button>
          <img src={images[currentIndex]} alt="Expanded View" className="max-h-[85vh] max-w-full object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={nextImage} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-[#fcfbf9] text-5xl md:text-7xl hover:text-gray-400 p-4 transition-colors">&#8250;</button>
        </div>
      )}
    </main>
  );
}