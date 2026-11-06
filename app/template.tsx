"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// True once the first page has been shown in this browser tab.
let hasShownFirstPage = false;

export default function Template({ children }: { children: React.ReactNode }) {
  // Skip the page-turn on the very first load: otherwise the whole page stays
  // invisible until JavaScript has loaded and the animation has run, which
  // delays the first paint by over a second on phones. Navigations between
  // pages still get the animation.
  const [isFirstPage] = useState(() => !hasShownFirstPage);

  useEffect(() => {
    hasShownFirstPage = true;
  }, []);

  return (
    <div style={{ perspective: "2000px" }}>
      <motion.div
        // Pivots on the right edge, swinging in from -90 degrees
        initial={isFirstPage ? false : { rotateY: -90, opacity: 0, transformOrigin: "right" }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        className="min-h-screen bg-[#fcfbf9]"
      >
        {children}
      </motion.div>
    </div>
  );
}
