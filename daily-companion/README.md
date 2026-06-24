# Daily Companion

An anti-doomscroll, anti-streak daily companion. No feed, no notifications, no audience. One page a day:

1. **Mood check-in** — picks today's voice from six rotating personalities (or skip, for a default deadpan voice).
2. **Hard or soft mode** — your call, both get genuine hype, just a different flavor of it.
3. **Routines** — your own short list of chores, narrated and hyped honestly by today's voice.
4. **Grounding** — one short breathing/sensory exercise.
5. **Curiosity** — one small wonder fact, with at most two "turn the page" extras. Not a feed.

Progress is a single counter toward a 30 or 75-day arc (day 30 is a checkpoint inside the 75, not a separate track). A missed day just doesn't advance the counter — there's no reset, no punishment. Past days show up in History as a calm, read-only log: proof something happened, not a dashboard to optimize.

## 1. Set up Supabase (free, ~5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.
4. Copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

> The schema enables Row Level Security with a permissive "allow anon" policy, meant for personal use with the link + key kept private.

## 2. Run it locally

```bash
npm install
npm run dev
```

## 3. Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host, setting the same two `VITE_SUPABASE_*` environment variables. Add to your phone's home screen for a full-screen, installable PWA.

## How the voice works

Your mood check-in maps to one of six personalities — Cozy Grandma, Proud Father, Deadpan Coach, Drill Sergeant (affectionate), Enthusiastic Best Friend, Dramatic Narrator. Each one narrates the same day honestly: hype is calibrated to what you actually did, under every voice, whether you chose hard mode or soft mode. Skipping the check-in defaults to the Deadpan Coach.
