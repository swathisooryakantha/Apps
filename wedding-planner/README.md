# Our Wedding Planner

A wedding planning app for a South Indian wedding — budget, multi-function events, guest list, accommodation mapping, vendors, checklist (with sub-tasks and owners), shopping/prep tracker, and a Pinterest/Instagram inspiration board. Installable as a PWA on iPad and Android, with data synced across devices via Supabase.

## 1. Set up Supabase (free, ~5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates all tables and opens them to your project's anon key.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

> Note: the schema enables Row Level Security with a permissive "allow anon" policy, since this is meant for personal/family use with the link + key kept private. Don't share your `.env` values publicly.

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

All data is stored in Supabase, so anything entered on one device shows up on the other in real time (on refresh).
