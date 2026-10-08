"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { collection, onSnapshot, query, addDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

const menuCategories = [
  "FRÜHSTÜCK",
  "GESCHMACKSSACHEN",
  "WINZERFLADEN",
  "HEISSGETRÄNKE",
  "ALKOHOLFREI",
  "APERITIF & BIER",
  "WEINE & LONGDRINKS"
];

const defaultTabImages: Record<string, string> = {
  "FRÜHSTÜCK": "/media/breakfast.jpg",
  "GESCHMACKSSACHEN": "/media/snacks.jpg",
  "WINZERFLADEN": "/media/flatbread.jpg",
  "HEISSGETRÄNKE": "/media/hot-drinks.jpg",
  "ALKOHOLFREI": "/media/cold-drinks.jpg",
  "APERITIF & BIER": "/media/beer-aperitif.jpg",
  "WEINE & LONGDRINKS": "/media/wine-longdrinks.jpg"
};

const fallbackReviews = [
  {
    id: "1",
    author: "Lisa K.",
    text: "Super schönes Café! Der Kaffee ist extrem lecker und die Winzerfladen sind ein Traum. Komme gerne in der Mittagspause her.",
    rating: 5
  },
  {
    id: "2",
    author: "Markus T.",
    text: "Richtig coole Einrichtung und sehr nettes Personal. Das Avocado-Sandwich war der Wahnsinn, nur am Wochenende am besten vorher reservieren.",
    rating: 4
  },
  {
    id: "3",
    author: "Julia S.",
    text: "Mein absoluter Lieblingsort in Schweinfurt für einen Aperol Spritz nach der Arbeit. Tolles Ambiente!",
    rating: 5
  },
  {
    id: "4",
    author: "Timo W.",
    text: "Das Frühstück für zwei ist preislich absolut fair und man wird mehr als satt. Sehr liebevoll angerichtet.",
    rating: 5
  },
  {
    id: "5",
    author: "Sophie M.",
    text: "Sehr entspannte Atmosphäre. Perfekt zum Abschalten. Die hausgemachte Limonade ist sehr zu empfehlen.",
    rating: 4
  }
];

const acrosticPoem = [
  { letter: "L", rest: "EBENSTRAUM" },
  { letter: "E", rest: "INZIGARTIG" },
  { letter: "I", rest: "MMERFRISCH" },
  { letter: "D", rest: "UFTENDER KAFFEE" },
  { letter: "E", rest: "RFOLGSREZEPTE" },
  { letter: "N", rest: "ACHHALTIGKEIT" },
  { letter: "S", rest: "ELBSTGEBACKEN" },
  { letter: "C", rest: "HARISMATISCH" },
  { letter: "H", rest: "ERZLICHKEIT" },
  { letter: "A", rest: "NDERS" },
  { letter: "F", rest: "AMILIENBETRIEB" },
  { letter: "T", rest: "ALENTSCHMIEDE" }
];

type MenuSize = { label?: string; price: string | number };

type MenuItem = {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  price?: string | number;
  sizes?: MenuSize[];
  isExtra?: boolean | string;
};

type Review = {
  id: string;
  author: string;
  text: string;
  rating: number;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// =========================================================================
// BULLETPROOF MOBILE VIDEO COMPONENT
// =========================================================================
const BackgroundVideo = ({
  src,
  fallbackGif,
  className
}: {
  src: string;
  fallbackGif: string;
  className: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoBlocked, setVideoBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const attemptPlay = async () => {
      try {
        await video.play();
      } catch {
        setVideoBlocked(true);
      }
    };

    attemptPlay();

    const handleInteraction = () => {
      if (videoBlocked && video) {
        video.muted = true;
        video.play().then(() => setVideoBlocked(false)).catch(() => {});
      }
    };

    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, [videoBlocked]);

  return (
    <>
      {!videoBlocked ? (
        <video
          ref={videoRef}
          src={src}
          className={className}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
        />
      ) : (
        <img src={fallbackGif} alt="Background fallback" className={className} />
      )}
    </>
  );
};

const parsePrice = (price: unknown): number => {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const cleaned = String(price).replace(",", ".").replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
};

export default function UnifiedHomePage() {
  const [activeTab, setActiveTab] = useState(menuCategories[0]);
  const [firestoreMenuData, setFirestoreMenuData] = useState<MenuItem[]>([]);
  const currentMenuImage = defaultTabImages[activeTab] || null;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    author: "",
    text: "",
    rating: 5
  });

  const sliderRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(h);
      document.documentElement.style.setProperty("--app-height", `${h}px`);
    };

    update();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    const t = setTimeout(update, 100);
    const t2 = setTimeout(update, 500);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  useEffect(() => {
    const qMenu = query(collection(db, "menu"));
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      setFirestoreMenuData(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }) as MenuItem)
      );
    });
    return () => unsubMenu();
  }, []);

  useEffect(() => {
    const qReviews = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      const fetchedReviews = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Review)
        .filter((r) => r.rating >= 3);
      if (fetchedReviews.length > 0) {
        setReviews(shuffleArray(fetchedReviews));
      } else {
        setReviews(shuffleArray(fallbackReviews));
      }
    });
    return () => unsubReviews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isExtraItem = (val: unknown) =>
    val === true || String(val).toLowerCase() === "true";

  const mainItems = firestoreMenuData
    .filter((item) => item.category === activeTab && !isExtraItem(item.isExtra))
    .sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

  const activeExtras = firestoreMenuData
    .filter((item) => item.category === activeTab && isExtraItem(item.isExtra))
    .sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      const targetY = menuSection.getBoundingClientRect().top + window.scrollY;
      animate(window.scrollY, targetY, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (value) => window.scrollTo(0, value)
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gdprConsent) {
      alert("Bitte stimmen Sie der Datenschutzerklärung zu, um die Bewertung abzusenden.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        author: reviewForm.author,
        text: reviewForm.text,
        rating: reviewForm.rating,
        createdAt: new Date().toISOString()
      });
      setIsReviewFormOpen(false);
      setReviewForm({ author: "", text: "", rating: 5 });
      alert("Vielen Dank für deine Bewertung!");
    } catch (error) {
      console.error("Fehler beim Speichern der Bewertung:", error);
      alert("Es gab ein Problem. Bitte versuche es später nochmal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render price / sizes
  const renderPrice = (item: MenuItem) => {
    if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          {item.sizes.map((s, idx) => (
            <span key={idx} className="font-bold text-[#cda1b1] text-sm md:text-base whitespace-nowrap">
              {s.label && <span className="text-[#a0a0a0] font-normal mr-1.5 text-xs">{s.label}</span>}
              € {s.price}
            </span>
          ))}
        </div>
      );
    }
    return (
      <span className="font-bold text-[#cda1b1] text-base md:text-lg whitespace-nowrap">
        € {item.price}
      </span>
    );
  };

  return (
    <main className="flex flex-col min-h-screen w-full bg-[#1c1a1d] relative selection:bg-[#cda1b1] selection:text-white">

      {/* FLOATING REVIEW WIDGET */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <button
          onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
          className="flex items-center gap-2 bg-[#1c1a1d]/80 backdrop-blur-md border border-[#cda1b1]/30 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#cda1b1] hover:text-[#1c1a1d] transition-all duration-500 group"
        >
          <span className="text-[#cda1b1] group-hover:text-[#1c1a1d] text-lg leading-none transition-colors">★</span>
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase mt-0.5">Bewerte uns</span>
        </button>

        <AnimatePresence>
          {isReviewFormOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-4 w-[calc(100vw-3rem)] max-w-85 bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 origin-top-left"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-[#2d2d2d]">Wie war dein Besuch?</h3>
                <button onClick={() => setIsReviewFormOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-3xl outline-none transition-colors ${
                        reviewForm.rating >= star ? "text-yellow-400" : "text-gray-200 hover:text-yellow-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="flex flex-col">
                  <input
                    type="text"
                    required
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="border-b border-gray-200 py-1.5 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] text-xs"
                    placeholder="Dein Vorname"
                  />
                </div>

                <div className="flex flex-col">
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    className="border-b border-gray-200 py-1.5 focus:outline-none focus:border-[#cda1b1] text-[#2d2d2d] text-xs resize-none"
                    placeholder="Deine Bewertung"
                  />
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="reviewGdprConsent"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 accent-[#cda1b1] border-gray-300 rounded"
                  />
                  <label htmlFor="reviewGdprConsent" className="text-xs text-[#a0a0a0] leading-relaxed">
                    Ich habe die <a href="/datenschutz" className="text-[#cda1b1] hover:underline">Datenschutzerklärung</a> gelesen und stimme der Veröffentlichung meines Vornamens, der Bewertung und des Textes zu. (Art. 6 Abs. 1 lit. a DSGVO)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Wird gesendet..." : "Absenden"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HERO SECTION */}
      <section
        className="relative z-0 w-full flex items-center justify-center overflow-hidden"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : "100dvh",
          minHeight: viewportHeight ? `${viewportHeight}px` : "100dvh"
        }}
      >
        <div className="absolute inset-0 w-full h-full -z-30">
          <BackgroundVideo
            src="/media/mainbar-hero.mp4"
            fallbackGif="/media/mainbar-hero.gif"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#121111]/45 z-10" />
        </div>

        <div className="relative z-20 w-full h-full flex">
          <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center -translate-y-1.75"
            >
              <div className="relative inline-flex flex-col items-center justify-center">
                <div className="absolute w-44 h-44 md:w-52 md:h-52 border-2 border-[#cda1b1]/55 rounded-full -top-7 left-1/2 translate-x-[-58%] z-0 pointer-events-none"></div>
                <div className="absolute w-44 h-44 md:w-52 md:h-52 border-2 border-[#cda1b1]/55 rounded-full -top-5 left-1/2 translate-x-[-38%] z-0 pointer-events-none"></div>
                
                <h1 className="font-(family-name:--font-great-vibes) text-8xl md:text-9xl lg:text-[9.5rem] text-[#cda1b1] relative z-10 leading-none drop-shadow-2xl">
                  MainBar
                </h1>
              </div>

              <div className="text-sm md:text-base tracking-[0.4em] text-white uppercase mt-2 z-10 drop-shadow-md text-center">
                Drinks & Food
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white tracking-[0.25em] uppercase text-base md:text-lg font-medium mt-10 mb-10 drop-shadow-md text-center"
            >
              Café & Patisserie
            </motion.h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <motion.button
                onClick={scrollToMenu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#cda1b1] text-[#1c1a1d] px-12 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-all duration-400 shadow-lg"
              >
                Zur Speisekarte
              </motion.button>

              <Link
                href="/booking"
                className="text-white hover:text-[#cda1b1] uppercase tracking-widest text-sm transition-colors border-b border-white/50 hover:border-[#cda1b1] pb-1 drop-shadow-md text-center"
              >
                Event & Catering Buchen
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center w-px relative">
            <div className="h-40 w-px bg-linear-to-b from-transparent via-[#cda1b1]/60 to-transparent"></div>
          </div>

          <div className="hidden lg:flex w-1/2 h-full items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative z-10 w-[70%] mx-auto px-6"
            >
              <p className="font-serif italic text-3xl text-white text-center leading-snug mb-6 drop-shadow-md">
                „Bei uns ist Qualität das Produkt
                <br />
                der Liebe zum Detail.“
              </p>

              <div className="w-12 h-px bg-[#cda1b1]/70 mx-auto mb-6"></div>

              <div className="flex flex-col gap-3">
                {acrosticPoem.map((line, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="font-serif text-2xl font-medium text-[#cda1b1] w-7 text-right drop-shadow-md shrink-0">
                      {line.letter}
                    </span>
                    <span className="font-serif text-sm tracking-[0.18em] uppercase text-white">
                      {line.rest}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-16 md:py-24 bg-[#faf8f5] overflow-hidden border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16 px-6">
            <h2 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mb-4">
              Das sagen unsere Gäste
            </h2>
            <div className="flex justify-center items-center gap-2 text-base text-[#a0a0a0] mb-6 font-bold tracking-widest uppercase">
              <span className="text-[#cda1b1]">★★★★★</span>
              Community
            </div>
            <div className="w-12 h-px bg-[#cda1b1] mx-auto"></div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-6 md:px-12 pb-8 scroll-smooth"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="snap-center shrink-0 w-70 md:w-87.5 bg-white p-8 rounded-3xl border border-[#cda1b1]/20 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
              >
                <div>
                  <div className="text-[#cda1b1] text-xl mb-4 tracking-widest">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <p className="text-[#2d2d2d] text-base md:text-lg italic leading-relaxed mb-6 font-light">
                    &bdquo;{review.text}&ldquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#cda1b1]/20 flex items-center justify-center text-[#cda1b1] font-bold text-sm">
                    {review.author.charAt(0)}
                  </div>
                  <p className="text-[#a0a0a0] text-xs md:text-sm font-bold uppercase tracking-widest">
                    {review.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section
        id="menu-section"
        className="min-h-screen bg-white px-4 md:px-6 py-16 md:py-24 relative overflow-x-clip"
      >
        {/* Background images (mobile + desktop) – same as your original */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 xl:hidden z-0">
          <div className="sticky top-0 w-full h-dvh">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.35]"
              style={{
                backgroundImage: `url(${currentMenuImage || '/media/breakfast.jpg'})`,
                filter: "blur(1.5px)",
                transition: "background-image 0.7s ease-in-out"
              }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-white via-white/10 to-white" />
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 bottom-0 w-[25vw] max-w-105 hidden xl:block z-0">
          <div className="sticky top-0 w-full h-screen">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.30]"
              style={{
                backgroundImage: `url(${currentMenuImage || '/media/breakfast.jpg'})`,
                filter: "blur(1.5px)",
                transition: "background-image 0.7s ease-in-out"
              }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-white" />
            <div className="absolute inset-0 bg-white/20" />
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 bottom-0 w-[25vw] max-w-105 hidden xl:block z-0">
          <div className="sticky top-0 w-full h-screen">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.30]"
              style={{
                backgroundImage: `url(${currentMenuImage || '/media/breakfast.jpg'})`,
                filter: "blur(1.5px)",
                transition: "background-image 0.7s ease-in-out"
              }}
            />
            <div className="absolute inset-0 bg-linear-to-l from-transparent via-white/20 to-white" />
            <div className="absolute inset-0 bg-white/20" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#2d2d2d] mb-4 md:mb-6">
              Main Menü
            </h2>
            <div className="w-12 h-px bg-[#cda1b1] mx-auto"></div>
          </div>

          <div className="flex justify-start lg:justify-center lg:flex-wrap gap-2 mb-10 md:mb-16 overflow-x-auto lg:overflow-x-visible hide-scrollbar pb-4 lg:pb-0 snap-x snap-mandatory">
            {menuCategories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`snap-center shrink-0 relative px-5 md:px-6 py-3 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors ${
                  activeTab === tab ? "text-[#1c1a1d]" : "text-[#a0a0a0] hover:text-[#2d2d2d]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-[#ebd2db] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="relative bg-linear-to-br from-[#faf8f5] to-[#f3ece9] border border-[#cda1b1]/30 rounded-3xl p-6 md:p-16 shadow-sm min-h-100 overflow-hidden"
            >
              <div aria-hidden="true" className="pointer-events-none select-none absolute -bottom-10 -right-10 font-(family-name:--font-great-vibes) text-[10rem] md:text-[14rem] text-[#cda1b1]/6 leading-none -rotate-6 z-0">
                MainBar
              </div>

              {currentMenuImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 3 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
className="hidden md:block absolute -top-8 -right-8 w-48 h-48 rounded-[40%_0_0_80%] overflow-hidden shadow-xl border-4 border-white z-20 pointer-events-none"                >
                  <Image
                    src={currentMenuImage}
                    alt={`${activeTab} Highlight`}
                    fill
                    sizes="(max-width: 768px) 0vw, 200px"
                    className="object-cover"
                  />
                </motion.div>
              )}

              <div className="relative z-10 w-full md:w-3/4 pr-0 md:pr-8">
                {mainItems.length === 0 && activeExtras.length === 0 ? (
                  <p className="text-[#a0a0a0] text-base py-10 text-center">
                    Keine Gerichte in dieser Kategorie gefunden.
                  </p>
                ) : (
                  <>
                    {mainItems.map((item) => (
                      <div key={item.id} className="mb-7 md:mb-9 group">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-300/50 pb-2 mb-2 gap-2 sm:gap-4">
                          <h3 className="font-serif text-lg md:text-xl text-[#2d2d2d] group-hover:text-[#cda1b1] transition-colors flex items-center gap-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-[#d66a7a] opacity-80 shrink-0">
                              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                            </svg>
                            {item.name}
                          </h3>

                          {/* ===== UPDATED PRICE / SIZES RENDER ===== */}
                          {renderPrice(item)}
                        </div>

                        {item.description && (
                          <p className="text-sm md:text-base text-[#808080] leading-relaxed font-light pl-6 md:pr-12 md:pl-7.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}

                    {activeExtras.length > 0 && (
                      <div className="mt-8 rounded-2xl border border-[#cda1b1]/40 bg-white/60 p-5 md:p-6 relative">
                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#cda1b1] mb-4">
                          Extras
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          {activeExtras.map((item) => (
                            <div key={item.id} className="flex items-baseline gap-2 text-sm md:text-base text-[#2d2d2d]">
                              <span className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[#d66a7a] opacity-70 shrink-0">
                                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                                {item.name}
                              </span>
                              <span className="flex-1 border-b border-dotted border-gray-300 -translate-y-0.75" />
                              <span className="font-bold text-[#cda1b1] whitespace-nowrap">
                                € {item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER – identical to your original */}
      <footer className="bg-[#1c1a1d] text-white py-16 px-6 md:px-12 border-t border-[#cda1b1]/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-(family-name:--font-great-vibes) text-5xl text-[#cda1b1] mb-4">MainBar</h2>
            <p className="text-[#a0a0a0] text-sm leading-relaxed text-center md:text-left">
              Qualität ist das Produkt
              <br />
              der Liebe zum Detail.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#cda1b1] font-bold mb-6">Besuchen Sie uns</h3>
            <a href="https://www.google.com/maps/search/?api=1&query=Spitalstra%C3%9Fe%2019%2C%2097421%20Schweinfurt" target="_blank" rel="noopener noreferrer" className="text-base text-gray-300 hover:text-[#cda1b1] mb-3 transition-colors">
              Spitalstraße 19<br />97421 Schweinfurt
            </a>
            <a href="tel:+491702278096" className="text-base text-gray-300 hover:text-[#cda1b1] transition-colors">
              +49 170 2278096
            </a>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#cda1b1] font-bold mb-6">Öffnungszeiten</h3>
            <p className="text-base text-gray-300 mb-2">Mo: Ruhetag</p>
            <p className="text-base text-gray-300 mb-2">Di - Sa: 09:30 - 18:00 Uhr</p>
            <p className="text-base text-gray-300">Sonn- u. Feiertage: 10:00 - 18:00 Uhr</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#cda1b1] font-bold mb-6">Social Media</h3>
            <a href="https://www.instagram.com/mainbar_sw/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-300 hover:text-[#cda1b1] transition-colors flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M16.11 7.5v.01" />
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
              Instagram
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#a0a0a0] uppercase tracking-widest">
            © {new Date().getFullYear()} MainBar Schweinfurt
          </p>
          <div className="flex gap-6">
            <Link href="/impressum" className="text-xs text-[#a0a0a0] hover:text-white uppercase tracking-widest transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="text-xs text-[#a0a0a0] hover:text-white uppercase tracking-widest transition-colors">Datenschutz</Link>
            <button 
              onClick={() => { 
                const event = new CustomEvent('open-cookie-settings');
                window.dispatchEvent(event);
              }} 
              className="text-xs text-[#a0a0a0] hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cookie-Einstellungen
            </button>
            <button 
              onClick={() => {
                const email = prompt("Bitte geben Sie Ihre E-Mail-Adresse ein, um einen Löschantrag zu stellen:");
                if (email) {
                  fetch("/api/gdpr-delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, type: "all" })
                  }).then(res => res.json()).then(data => {
                    if (data.success) {
                      alert(data.message || "Ihre Daten wurden erfolgreich gelöscht.");
                    } else {
                      alert(data.error || "Fehler beim Löschen der Daten.");
                    }
                  }).catch(() => alert("Fehler bei der Anfrage."));
                }
              }}
              className="text-xs text-[#a0a0a0] hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              Daten löschen
            </button>
          </div>
        </div>
      </footer>

      <Link href="/admin" className="absolute bottom-0 right-0 w-16 h-16 bg-transparent text-transparent cursor-default select-none z-0" tabIndex={-1} aria-hidden="true">.</Link>
    </main>
  );
}