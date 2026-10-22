# Vinden

Vinden is a proof-of-work professional network for students and early-career professionals (18–30). This repo holds the web app (desktop and mobile web) and its demo API, plus the design files it came from.

## Run it locally

Double-click `start.command`, or run this in the folder:

```bash
npm run dev
```

The first run needs `npm install` (start.command does it for you). Node.js 20.19+ or 22.12+.

`npm run dev` starts two servers side by side:

| | What it is | Where it runs |
|---|---|---|
| Web app (`apps/web`) | React 19 + TypeScript, built with Vite, routing by React Router, data by TanStack Query. Live reload: saved edits show up instantly. | http://localhost:5180 |
| Demo API (`apps/api`) | A Fastify (Node.js) server with sample data in an embedded Postgres database (PGlite). The data lives in `apps/api/.data` and is created on first start. | port 4100, behind the scenes |

You only ever open port 5180. When a page needs data it calls `/api/...`, and Vite forwards that to the API on port 4100. The app is signed in as Ishaan Sethi, a club member at Meridian College.

The ports differ from Vite's default 5173 so Vinden can run alongside other local projects. Both are fixed: if one is taken, the server stops with an error rather than moving.

`npm run db:reset` deletes the demo database; the next start rebuilds it from the seed (`apps/api/src/seed.ts`). Vouches and saves you make in the app persist until then.

## What's in the app

- **Home** (`/`): search, your journey, your club's task, live problem statements, verified work. Filter by Saved, problem statements or verified work, or by category from the header.
- **Proof of Work** (`/work/:slug`): the work, how it was verified (AI check, club review, company sign-off), who did what, and weighted vouches. Vouch for it, or undo.
- **Profile** (`/people/:handle`): identity, stats, milestones, verified work, experience with its verification method, and the journey timeline.

One responsive layout: at 768px and wider you get the desktop header and two-column pages; below that, the phone layout with a bottom tab bar.

## Other folders

- `design/app-screens/` — the original screen designs (Claude Design canvas source): https://claude.ai/artifact/ThUjju4nKmcXNww3o9xVja (private until shared).
- `assets/` — the Sunrise logo, cut out with transparent corners.

## Brand palette

| Name | Hex |
|---|---|
| Night Navy | `#07142F` |
| Horizon Blue | `#1565D8` |
| Dawn Orange | `#F7841E` |
| Sun Gold | `#FFD23F` |
| Dusk Lavender | `#B7A4F2` |
| Morning Cream | `#FDFBF6` |
