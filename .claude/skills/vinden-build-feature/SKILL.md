---
name: vinden-build-feature
description: The end-to-end workflow for designing and building a Vinden feature, from the Notion feature map through Figma to responsive code, plus the frontend architecture decision (one responsive React app). Use when asked to build, design or ship any Vinden screen or feature, or when deciding how web and mobile web should differ.
---

# Building a Vinden feature

## Frontend architecture (decided 22 Oct 2026)

Vinden ships as **one responsive web app**: desktop browser and mobile browser, with no native app. It has the same URLs, the same components and the same API on every device.

- **One stylesheet with one breakpoint at 768 px.** Below 768 px is the phone layout; 768 px and up is desktop. The existing convention is base rules for desktop, with phone overrides in `@media (max-width: 767px)`. Keep to it, so both layouts can be read side by side.
- **Where the interaction differs, render both and switch with CSS** (`.desktop-only` / `.mobile-only`), never with user-agent sniffing. Examples:
  - Top nav vs tab bar
  - Side panel vs sticky action bar
  - Grid vs rail
  - All-steps form vs one step per screen

  CSS switching keeps one HTML output and survives resizing and rotation.
- **Stack:** React 19, TypeScript, Vite, React Router, TanStack Query; the API is Fastify. Styles are CSS custom properties named after the Figma variables, with no CSS-in-JS runtime.
- **Before launch:** move to React Router v7 framework mode with server rendering for public pages (`/work/:slug`, `/people/:handle`, clubs, briefs). WhatsApp, LinkedIn and Google read the HTML without running JavaScript, so shared Proof of Work links need real titles, descriptions and preview images. Signed-in screens can stay client-rendered. Add a web app manifest so people can add Vinden to their home screen.
- **Mobile web specifics:**
  - Respect `env(safe-area-inset-bottom)` for the tab bar and action bars.
  - Use `100dvh`, not `100vh`.
  - Inputs need a 16 px or larger font.
  - Touch targets are at least 44 px.
  - No hover-only affordances.

## Workflow

1. **Find the feature** in the Notion feature map ("Vinden feature map"). Note its flow, roles, priority, status and the components it lists. If it isn't there, add it before building.
2. **Read the rules.** The vinden-product skill covers the flow steps, permissions, business rules and open decisions. If the feature touches an open decision, choose the most reversible option and record it in the feature's Notes.
3. **Plan the hierarchy** with vinden-information-architecture: the URL, what comes first, desktop vs phone, and the states (loading, empty, error).
4. **Compose from the library.** Read the vinden-atom-* and vinden-component-* skills for each part you use. Use the components and tokens as they are.
5. **Expand the system when a pattern repeats.** If you need something new that a second screen will also need, add it as a component in Figma (with variants, properties, bound tokens and a description), then in code, then write its skill (copy an existing vinden-component-* skill's structure). A one-off stays local to the page.
6. **Design both layouts in Figma** on the Screens / Web and Screens / Mobile pages, using component instances only: 1440 wide for desktop, 390 wide for phone.
7. **Build it.**
   - Routes go in `apps/web/src/App.tsx`.
   - Pages go in `apps/web/src/pages/`.
   - Shared components go in `apps/web/src/components/`.
   - Data hooks go in `apps/web/src/api.ts`.
   - API routes go in `apps/api/src/app.ts`, with queries in `queries.ts` and tables in `schema.ts`. Use `ADD COLUMN IF NOT EXISTS` for changes to existing tables.
   - CSS goes in `styles.css`, in the matching section: base rules (desktop), then phone overrides in `@media (max-width: 767px)`. New rules use the `--color-*` tokens.
   - **Figma limits:** you can't resize layers inside an instance. Bars that show data (the Contribution split) are detached on the screen; the Progress bar has Value variants. After swapping an icon in a Primary button, set the icon to `icon/inverse` again.
8. **Verify.** Run `npm run dev` and open http://localhost:5180 at 1440 and 390 wide. Check keyboard focus and screen reader names, and run `npm run typecheck`.
9. **Close the loop.** Set the Notion feature's status, and update any skill whose component changed.

## Branches

- `main` holds the released state.
- Feature work happens on branches. `Vinden-web` and `vinden-mob` are the web and mobile work streams for the Club and Post work screens. `vinden-mob` builds on `Vinden-web`, so merge `Vinden-web` first.
- Commits explain why. Don't push to `main` without the team's approval.
