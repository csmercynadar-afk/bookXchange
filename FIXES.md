# BookXchange – what was fixed

## Run it (Windows, from scratch)
    cd backend
    npm install        # <- this installs nodemon; "nodemon is not recognized" = this was never completed
    npm run dev

    cd ../frontend
    npm install
    npm run dev

## 1. Forgot-password OTP (Resend)
- Resend's free sender `onboarding@resend.dev` can only deliver to the email you registered Resend with.
  Anyone else gets rejected, and the old code hid that error and said "Code sent".
- `utils/sendEmail.js` now tries Resend, then automatically falls back to Gmail SMTP (EMAIL_USER / EMAIL_PASS),
  prints the real reason in the server console, and the API returns an honest error if both fail.
- For production: verify a domain at resend.com/domains and set EMAIL_FROM in backend/.env.

## 2. Backend / nodemon / MongoDB
- nodemon missing -> `npm install` inside backend (it is in package.json; install had not finished).
- backend.log showed EADDRINUSE on port 20128: a leftover Windows environment variable PORT=20128 beat
  the PORT in .env. server.js now uses dotenv `override: true`, and prints how to free a port.
- MongoDB: db.js retries with public DNS (common `querySrv ECONNREFUSED` problem on Windows) and prints
  the likely cause (Atlas IP allow-list, password encoding, paused cluster). Server only starts after DB connects.
- If it still fails: Atlas -> Network Access -> add 0.0.0.0/0 (dev).

## 3. Book covers
- The fallback image used via.placeholder.com, which no longer exists, so broken covers showed blank.
- New `components/BookCover.jsx`: inline SVG fallback, treats 1x1 blank images (OpenLibrary) as broken,
  used in BookCard, BookDetail, MyListings, Wishlist.

## 4. Clerk / OAuth
- Clerk was not actually wired into the app (only keys in .env, and in the wrong place/name for Vite).
- Added: ClerkProvider (main.jsx), "Continue with Google" button on Login + Signup, /sso-callback,
  /auth/clerk-complete, and backend `POST /api/auth/clerk` which verifies the Clerk session and issues the
  normal BookXchange JWT (so the rest of the app is unchanged).
- Also fixed the existing auth: /auth/refresh and /auth/logout were never routed or exported, cookie-parser
  was missing, CORS blocked cookies, and a wrong password triggered a refresh + page reload.
- Clerk dashboard (one-time): User & Authentication -> Social connections -> enable Google.
