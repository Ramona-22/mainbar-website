/*
  The bean intro plays only on a visitor's first visit; afterwards this localStorage key skips it.
  A plain module (no "use client") so the root layout, a Server Component, can use the script string.
  Every storage access is guarded: with storage blocked the intro simply plays again.
*/
export const INTRO_SEEN_KEY = "mb-intro-seen";

// A reload (F5) plays the intro again on purpose, so it can be shown to someone on demand.
const isReload = () => {
  try {
    return (
      (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload"
    );
  } catch {
    return false;
  }
};

export function introSeen() {
  if (isReload()) return false;
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberIntroSeen() {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // storage blocked: the intro plays again next time
  }
}

/*
  Runs before the first paint and marks <html> for returning visitors, so CSS hides the
  server-rendered intro overlay and they never see a dark flash before React takes over.
*/
export const introSeenScript = `try{var n=performance.getEntriesByType("navigation")[0];if(!(n&&n.type==="reload")&&localStorage.getItem("${INTRO_SEEN_KEY}")==="1")document.documentElement.dataset.introSeen="1"}catch(e){}`;
