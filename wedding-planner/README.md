# Wedding Planner

A wedding planning app — budget, multi-function events, guest list, accommodation mapping, vendors, checklist (with sub-tasks and owners), shopping/prep tracker, and a Pinterest/Instagram inspiration board. Installable as a PWA on iPad and Android, with data synced across devices via Supabase.

Anyone can sign in (Google or an emailed link) and create their own wedding. Each wedding's data is private to its members, enforced by Row Level Security in the database.

## 1. Set up Supabase (free, ~10 minutes)

Use a **new** Supabase project for this version — the schema is not compatible with the old single-couple one.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. It's safe to run again later.
3. **Authentication → URL Configuration:** set **Site URL** to where the app will live (e.g. `https://your-app.vercel.app`), and add `http://localhost:5173` under **Redirect URLs** for local testing.
4. **Authentication → Sign In / Providers → Email:** leave it enabled. This powers the "Email me a sign-in link" button. The built-in email sender only allows a few emails per hour, which is fine for a couple; Google sign-in doesn't use email at all.
5. **Google sign-in (recommended):**
   1. In [Google Cloud Console](https://console.cloud.google.com/), create a project, then **APIs & Services → OAuth consent screen** (External, add your app name and email).
   2. **Credentials → Create credentials → OAuth client ID → Web application.** Under **Authorized redirect URIs**, add the callback URL shown in Supabase under **Authentication → Sign In / Providers → Google** (it looks like `https://<project-ref>.supabase.co/auth/v1/callback`).
   3. Copy the client ID and secret into that Google provider page in Supabase and enable it.
   4. While the Google app is unverified, people see an "unverified app" notice once — they can continue past it. Verification only matters if the app goes public.
6. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
7. Copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

> The anon key is meant to be public — it ships inside the app. Privacy comes from the database rules: a signed-in user can only read or change weddings they are a member of.

> Free Supabase projects pause after about a week with no activity. Data is kept; restore the project from the Supabase dashboard.

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed URL in your browser.

## 3. Deploy so it's reachable from your iPad and phone

Deploy the `wedding-planner` folder to any static host that supports Vite builds, e.g. **Vercel** or **Netlify** (both have free tiers):

```bash
npm run build
```

Then deploy the `dist/` folder, or connect the repo directly to Vercel/Netlify and set the same two `VITE_SUPABASE_*` environment variables in their dashboard.

## 4. Install on iPad (Safari)

1. Open the deployed URL in Safari.
2. Tap the **Share** icon → **Add to Home Screen**.
3. It now opens full-screen like a native app, and syncs with your phone automatically.

## 5. Install on Android (Chrome)

1. Open the deployed URL in Chrome.
2. Tap the **⋮** menu → **Add to Home screen** / **Install app**.
3. Confirm — it installs like a native app.

## Features

- **Dashboard** — countdown, budget summary, guest/vendor/task stats.
- **Events** — multiple ceremonies (engagement, muhurtham, reception, etc.) each with its own date, time, and venue.
- **Budget** — categories, estimated vs. actual cost, paid status.
- **Guests** — RSVP tracking, side/group, plus-ones, accommodation flag.
- **Stay** — accommodation venues and rooms, with guest-to-room mapping for out-of-town guests.
- **Vendors** — category, contact, price, booking status.
- **Checklist** — timeframe-based tasks, each assignable to an owner (you, partner, family member), with sub-tasks and a progress bar (e.g. "Jewellery shopping" → ring, necklace, mangalsutra).
- **Shopping & Prep** — saree shopping, blouse stitching, jewelry, invitations, etc. with cost and status tracking.
- **Inspiration Board** — save Pinterest/Instagram links and reference images by category.

All data is stored in Supabase, so anything entered on one device shows up on the other (on refresh).
