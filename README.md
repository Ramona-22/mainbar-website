# MainBar Website

Website for MainBar, café & bar in Schweinfurt (Spitalstraße 19). Built with Next.js 16 (App Router), Tailwind CSS 4, Framer Motion and Firebase.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: hero video, live menu (from Firestore), reviews, footer |
| `/booking` | Table / catering request form (stored in Firestore, notification via `/api/booking`) |
| `/admin` | Staff portal (Firebase Auth): manage bookings and menu items |
| `/impressum`, `/datenschutz` | Legal pages |
| `/rustic/*`, `/menu`, `/gallery`, `/contact` | Alternative design template pages |
| `/api/gdpr-delete` | GDPR data deletion endpoint |

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Firebase, Gmail and Upstash values
npm run dev
```

## Scripts

- `npm run dev` – development server on http://localhost:3000
- `npm run build` / `npm start` – production build and server
- `npm run lint` – ESLint
- `npm test` – Vitest unit tests (booking validation, rate limiting, client IP)

## Before going live

- Fill in the owner's name (and VAT ID, if any) in `app/impressum/page.tsx` and `app/datenschutz/page.tsx`, then remove the template notice at the bottom of the Impressum.
- Set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in production so booking rate limiting is active.
- Set `NEXT_PUBLIC_SITE_URL` to the live domain (used by `sitemap.xml`, `robots.txt` and social previews).
