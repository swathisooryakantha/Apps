# Wedding Planner

A wedding planning app — budget, multi-function events, guest list, accommodation mapping, vendors, checklist (with sub-tasks and owners), shopping/prep tracker, and a Pinterest/Instagram inspiration board. Installable as a PWA on iPad and Android, with data synced across devices via Supabase.

Anyone can sign in with an emailed link and create their own wedding. Each wedding's data is private to its members, enforced by Row Level Security in the database.

## 1. Set up Supabase (free, ~10 minutes)

Use a **new** Supabase project for this version — the schema is not compatible with the old single-couple one.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. It's safe to run again later.
3. **Authentication → URL Configuration:** set **Site URL** to where the app will live (e.g. `https://your-app.vercel.app`). Under **Redirect URLs**, add `https://your-app.vercel.app/**` and `http://localhost:5173/**` (the `/**` lets invite links survive sign-in).
4. **Authentication → Sign In / Providers → Email:** leave it enabled. This powers the "Email me a sign-in link" button. The built-in email sender only allows a few emails per hour, which is fine for a couple.
5. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
6. Copy `.env.example` to `.env` and fill in those two values:
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

**Vercel, step by step:**

1. **Add New → Project**, import this repo, set **Root Directory** to `wedding-planner` (framework: Vite), and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production and Preview. Deploy.
2. Vercel's first build uses the repo's default branch. To deploy another branch, either set it under **Settings → Environments → Production → Branch Tracking**, or use the branch's own link (`<project>-git-<branch>-<team>.vercel.app`), which updates on every push to that branch.
3. If you use a branch link, turn off **Settings → Deployment Protection → Vercel Authentication** so people can open it without a Vercel account.
4. Put the app's URL in Supabase **Authentication → URL Configuration** (Site URL, plus `https://<url>/**` under Redirect URLs).

## 4. Install on iPad (Safari)

1. Open the deployed URL in Safari.
2. Tap the **Share** icon → **Add to Home Screen**.
3. It now opens full-screen like a native app, and syncs with your phone automatically.

## 5. Install on Android (Chrome)

1. Open the deployed URL in Chrome.
2. Tap the **⋮** menu → **Add to Home screen** / **Install app**.
3. Confirm — it installs like a native app.

## Planning together

Open **Settings** (in the sidebar, or **More** on a phone) to invite your partner:

1. Enter their email (recommended — only that email can use the link) and tap **Create invite link**.
2. Send the link by WhatsApp, text, or **Email it**. It works once and expires after 7 days.
3. They open it, sign in, and tap **Join wedding**. You're now co-owners with equal access.

**Dashboard photos:** the slideshow starts with illustrated scenes. Tap **Change photos** to add your own (stored privately — only co-owners can see them) and, if you like, turn the illustrations off.

A wedding can have two co-owners. Either can leave (the wedding stays with the other) or delete the wedding after typing its name. **Export my data** downloads everything as a JSON backup.

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
