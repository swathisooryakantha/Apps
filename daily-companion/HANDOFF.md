# Handoff: Daily Companion → new repo

This app was originally built inside the `swathisooryakantha/apps` monorepo on branch
`claude/daily-companion-app-vmwusi`, then moved here so it can live in its own repo
(per user preference — they're building many separate apps, one repo each).

## What this app is

An anti-doomscroll, anti-streak daily companion. No feed, no notifications, no
audience. One page a day: mood check-in (maps to one of 6 rotating voice
personalities) → hard/soft mode → routines/chores (narrated by the day's voice,
hype calibrated to what was actually done) → a short grounding exercise → one
finite curiosity/wonder fact (max 2 "turn the page" extras, not a feed). Progress
is a single counter toward a 30 or 75-day arc (day 30 is a checkpoint inside the
75, not a separate track). Missing a day never resets the counter. History is a
calm read-only log, not a dashboard.

Full feature writeup is in `README.md` in this same folder.

## Architecture

- React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4 + react-router-dom 7 +
  @supabase/supabase-js + vite-plugin-pwa — same stack/conventions as the sibling
  `wedding-planner` app this was modeled after.
- `src/lib/types.ts` — all domain types (Mood, Personality, Mode, DayStep, etc).
- `src/lib/voices.ts` — the 6-personality content bank + getter functions.
- `src/lib/grounding.ts`, `src/lib/curiosity.ts` — fixed (non-infinite) content lists.
- `src/lib/moon.ts` — pure-math moon phase, no API call.
- `src/lib/rng.ts` — deterministic seeded RNG so a day's content is stable on
  re-render but varies day to day.
- `src/hooks/useTable.ts` — generic Supabase CRUD hook (optimistic local state).
- `src/hooks/useAppSettings.ts` — single-row settings hook (challenge length/start date).
- `src/pages/Today.tsx` — the core page: a state machine driven by
  `daily_entries.current_step` ('mood'→'mode'→'routines'→'grounding'→'curiosity'→'done'),
  all in one page (not separate routes) per the "one page a day" spec.
- `src/pages/History.tsx`, `src/pages/Settings.tsx` — supporting pages.
- `supabase/schema.sql` — full schema, RLS with permissive "allow anon" policies
  (same pattern as wedding-planner — intended for personal use via link + anon key
  kept private).

Build/lint/typecheck were all verified clean. Browser-driven UI verification was
attempted but blocked by sandbox network policy (couldn't download a Chromium
binary for Playwright); a Supabase REST curl smoke test was inconclusive
(empty response, not fully diagnosed — worth re-checking with `-i -w
"%{http_code}"` flags if issues come up).

## Supabase setup (already done once — same project reused)

The user already has a Supabase project (shared with their other app,
`wedding-planner` — table names don't collide so reuse is fine). They ran
`supabase/schema.sql` in the SQL editor successfully. Their `.env` (gitignored,
not in this tarball) has:

```
VITE_SUPABASE_URL=https://iygurdzbudkeaxsxynnl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_1WZTzKK6-bwMsK7M4GNKqg_l2hyDnMn
```

If `.env` isn't present in the new repo checkout, recreate it from
`.env.example` with those same values (or have the user re-paste them — they're
not secret-sensitive, it's a publishable anon key).

## Why this handoff file exists

This session's GitHub MCP tools were scoped only to `swathisooryakantha/apps`,
with no way to add the new `daily-companion` repo to scope (no `add_repo`/
`list_repos` tool was available, and `create_repository` got a 403 — token
lacks repo-creation scope). The local git proxy also enforces the same
per-session repo allowlist (confirmed via a blocked `git clone` to the new
repo's URL). So the code had to be handed off as a tarball for a *new* session
scoped to the new repo to push from scratch, rather than pushed directly from
the old session.

## Next steps in the new session

1. Extract the tarball into the new repo's working directory.
2. `git add -A && git commit -m "Initial commit: Daily Companion app"`.
3. `git push -u origin main` (or whatever the default branch is).
4. Tell the user to create a new Vercel project pointing at this repo (root
   directory can be left at `/` since this repo only contains this one app),
   and set the two `VITE_SUPABASE_*` env vars in Vercel's project settings.
