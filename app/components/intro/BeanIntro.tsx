"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { introSeen, rememberIntroSeen } from "./introSeen";
import { useLanguage } from "../../context/LanguageContext";

const noSubscribe = () => () => {};
// Heavy, weighted ease used for every reveal in the intro.
const ease = [0.32, 0.72, 0, 1] as const;
// Fine paper grain (SVG noise), drawn once as a background image.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * First-visit intro on the homepage: a fine-dust coffee bean (from the Yetenbi site) that pours
 * into a hairline and then draws the real homepage, which appears under the drawing.
 */
export default function BeanIntro() {
  /*
    The server can't know whether this is a first visit, so it always renders the overlay. For
    returning visitors an inline script in the root layout marks <html> before the first paint and
    CSS hides the overlay (no flash); once hydrated, storage is read here and the intro unmounts.
  */
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const reduce = useReducedMotion();
  const { L } = useLanguage();
  // Rendered from the root layout, but plays on the homepage only.
  const onHome = usePathname() === "/";
  const skipIntro = !onHome || (hydrated && (introSeen() || !!reduce));

  const overlayRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperDecorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // `leaving` fades the overlay out (skip button or 3D failure); a normal run ends via `done`.
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [done, setDone] = useState(false);

  const skip = useCallback(() => {
    setSkipped(true);
    setLeaving(true);
  }, []);

  // After a fade-out: remembered only if the visitor saw the bean or chose "Überspringen". If
  // WebGL was too slow and the safety timeout closed the overlay, the intro plays next visit.
  const afterFade = useCallback(() => {
    if (ready || skipped) rememberIntroSeen();
    setDone(true);
  }, [ready, skipped]);

  // Start the 3D scene (three.js is downloaded only now).
  useEffect(() => {
    if (!hydrated || skipIntro || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // If WebGL never comes up, don't trap the visitor behind the overlay.
    const fallback = setTimeout(() => setLeaving(true), 4000);

    import("./beanScene")
      .then(({ startBeanScene }) => {
        if (cancelled) return;
        stop = startBeanScene(canvas, {
          onReady: () => {
            clearTimeout(fallback);
            setReady(true);
          },
          // Lights dim: the cream paper turns to the page's dark tone (#1c1a1d) as the drawing
          // completes, then dissolves, so the real page appears under the drawing without a
          // bright cream wash over the dark video.
          onReveal: (dusk, reveal) => {
            const paper = paperRef.current;
            if (paper) {
              const mix = (a: number, b: number) => Math.round(a + (b - a) * dusk);
              paper.style.backgroundColor = `rgb(${mix(250, 28)}, ${mix(248, 26)}, ${mix(245, 29)})`;
              paper.style.opacity = String(1 - reveal);
            }
            if (paperDecorRef.current) paperDecorRef.current.style.opacity = String(1 - dusk);
            if (overlayRef.current) overlayRef.current.style.pointerEvents = reveal > 0.5 ? "none" : "";
          },
          onDone: () => {
            rememberIntroSeen();
            setDone(true);
          },
        });
      })
      .catch((err) => {
        console.warn("[intro] 3D scene unavailable:", err);
        setLeaving(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      stop?.();
    };
  }, [hydrated, skipIntro]);

  // Hold the page still while the intro covers the screen.
  useEffect(() => {
    if (!hydrated || skipIntro || done) return;
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [hydrated, skipIntro, done]);

  if (skipIntro || done) return null;

  return (
    <AnimatePresence onExitComplete={afterFade}>
      {!leaving && (
        <motion.div
          key="bean-intro"
          ref={overlayRef}
          className="bean-intro fixed inset-0 z-100"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease }}
          aria-label="Intro"
        >
          {/* Paper: cream, a faint warm vignette and fine grain. Clears at the end. */}
          <div ref={paperRef} className="absolute inset-0 bg-[#faf8f5]">
            <div ref={paperDecorRef} className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(205,161,177,0.14)_0%,rgba(243,236,233,0.5)_38%,transparent_72%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
            </div>

            {ready && (
              <>
                {/* Progress hairline */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 7.2, ease: [0.45, 0, 0.55, 1] }}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[#cda1b1]/70"
                />

                {/* Caption: masked slide-up reveals, a drawn hairline between. */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 4.0, duration: 0.6, ease }}
                  className="pointer-events-none absolute inset-x-0 bottom-[11%] flex flex-col items-center px-6 text-center"
                >
                  <div className="overflow-hidden pb-1">
                    <motion.img
                      src="/media/mainbar-logo.svg"
                      alt="MainBar"
                      width={624}
                      height={392}
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ delay: 1.3, duration: 1.2, ease }}
                      className="h-auto w-64 md:w-80"
                    />
                  </div>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.9, duration: 1.0, ease }}
                    className="mt-3 block h-px w-16 bg-[#cda1b1]/60"
                  />
                  <div className="mt-4 overflow-hidden">
                    <motion.p
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ delay: 2.2, duration: 1.0, ease }}
                      // pl matches the letter spacing, which adds space after the last letter,
                      // so the text sits exactly on the centre line under the hairline.
                      className="pl-[0.42em] text-center font-(family-name:--font-playfair) text-[11px] uppercase tracking-[0.42em] text-[#353941]/70"
                    >
                      Café &amp; Bistro
                    </motion.p>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

          <button
            type="button"
            onClick={skip}
            className="group absolute bottom-6 right-6 flex items-center gap-3 rounded-full bg-white/60 py-1.5 pl-5 pr-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-[#353941] ring-1 ring-[#353941]/10 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/90 active:scale-[0.98] md:bottom-8 md:right-8"
          >
            {L("Überspringen", "Skip")}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#cda1b1]/20 text-[#d66a7a] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
