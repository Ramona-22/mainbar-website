"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { introSeen, rememberIntroSeen } from "./introSeen";

const noSubscribe = () => () => {};
const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Full-screen 3D coffee-bean intro (from the Yetenbi site) on a visitor's first visit;
 * it then lifts away to reveal the homepage.
 */
export default function BeanIntro() {
  /*
    The server can't know whether this is a first visit, so it always renders the overlay. For
    returning visitors an inline script in the root layout marks <html> before the first paint and
    CSS hides the overlay (no dark flash); once hydrated, storage is read here and the intro unmounts.
  */
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const reduce = useReducedMotion();
  // Rendered from the root layout, but plays on the homepage only.
  const onHome = usePathname() === "/";
  const skipIntro = !onHome || (hydrated && (introSeen() || !!reduce));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [done, setDone] = useState(false);

  const skip = useCallback(() => {
    setSkipped(true);
    setLeaving(true);
  }, []);

  // Remembered only if the visitor saw the bean or chose "Überspringen". If WebGL was too slow
  // and the safety timeout closed the overlay, they get the intro on their next visit.
  const end = useCallback(() => {
    if (ready || skipped) rememberIntroSeen();
    setDone(true);
  }, [ready, skipped]);

  // Start the 3D scene (three.js is downloaded only now).
  useEffect(() => {
    if (!hydrated || skipIntro || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // If WebGL never comes up, don't trap the visitor behind a dark screen.
    const fallback = setTimeout(() => setLeaving(true), 4000);

    import("./beanScene")
      .then(({ startBeanScene }) => {
        if (cancelled) return;
        stop = startBeanScene(canvas, {
          onReady: () => {
            clearTimeout(fallback);
            setReady(true);
          },
          onLeave: () => setLeaving(true),
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

  if (skipIntro || done || !onHome) return null;

  return (
    <AnimatePresence onExitComplete={end}>
      {!leaving && (
        <motion.div
          key="bean-intro"
          className="bean-intro fixed inset-0 z-100 bg-[#1c1a1d]"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1.1, ease }}
          aria-label="Intro"
        >
          <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(205,161,177,0.18)_0%,rgba(201,162,74,0.07)_40%,transparent_70%)]" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -16],
                filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
              }}
              transition={{ duration: 3.6, delay: 1.2, times: [0, 0.2, 0.8, 1] }}
              className="pointer-events-none absolute inset-x-0 bottom-[10%] px-6 text-center"
            >
              <p className="font-(family-name:--font-great-vibes) text-6xl text-[#cda1b1] md:text-7xl">MainBar</p>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-white/60">drinks &amp; food</p>
            </motion.div>
          )}

          <button
            type="button"
            onClick={skip}
            className="absolute bottom-6 right-6 rounded-full border border-white/15 bg-black/30 px-5 py-2.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md transition-colors hover:border-[#cda1b1]/60 hover:text-[#cda1b1] md:bottom-8 md:right-8"
          >
            Überspringen
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
