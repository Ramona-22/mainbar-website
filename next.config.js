const isDev = process.env.NODE_ENV !== "production";
// Test builds that talk to the local Firebase emulators (npm run test:e2e).
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1";

// Content Security Policy. 'unsafe-inline' for scripts is needed because Next
// inlines its bootstrap scripts (switching to nonces would make every page
// dynamic). The policy still blocks third-party scripts, plugins, framing of
// this site and data being sent to unknown hosts.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com${
    useEmulators ? " http://127.0.0.1:8080 http://127.0.0.1:9099 ws://127.0.0.1:8080" : ""
  }`,
  "frame-src https://*.firebaseapp.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev || useEmulators ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Photos/videos in public/media: cache for a day, then refresh in the
      // background. File names are not versioned, so keep this short.
      {
        source: "/media/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // Keep the admin area out of search results even if it gets linked.
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

module.exports = nextConfig;
