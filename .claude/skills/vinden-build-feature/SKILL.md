---
name: vinden-build-feature
description: The end-to-end workflow for designing and building a Vinden feature, from the Notion feature map through Figma to responsive code, plus the frontend architecture decision (one responsive React app). Use when asked to build, design or ship any Vinden screen or feature, or when deciding how web and mobile web should differ.
---

# Building a Vinden feature

## Frontend architecture (decided 22 Oct 2026)

Vinden ships as **one responsive web app**: desktop browser and mobile browser, with no native app. It has the same URLs, the same components and the same API on every device.

- **Three layouts (since 30 Oct 2026): desktop, tablet and phone.**
  - **Desktop is the base:** 1,100 px and up, a 1,200 px container with 32 px gutters.
  - **Tablet** overrides go in `@media (min-width: 768px) and (max-width: 1099px)`: full width, 24 px gutters, search moves to Explore, side panels wrap below.
  - **Phone** overrides go in `@media (max-width: 767px)`: 18 px gutters, rails, a tab bar and an action bar.
  - Keep the three blocks in that order in every stylesheet, so the layouts can be read side by side.
  - `.desktop-only` / `.mobile-only` still switch at 768 px.
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
7. **Build it.** The feature register (`docs/vinden-feature-register-v0.1.html`) is the spec. Every screen's "Must contain" list must be present. Where a screen depends on an open question (R-xx), pick the most reversible behaviour and comment `// Open question R-xx`.
   - **Routes:** all routes are in `apps/web/src/App.tsx`, annotated with their register item codes.
   - **Pages and data hooks:** each feature area has a folder `apps/web/src/features/<area>/` (onboarding, work, community, training) holding its pages, its `api.ts` hooks and its `<area>.css`. The older pages Home, Post, Work and Profile live in `apps/web/src/pages/`.
   - **Shared components:**
     - They go in `apps/web/src/components/`.
     - Every screen is wrapped in `<Page>` from components/Page.tsx (vinden-component-page-header).
     - Use `<Gate>` for role-only screens, and `<Board>`, `<EmptyState>` and `<TabRow>` where they fit.
   - **API:**
     - `apps/api/src/app.ts` only starts things up.
     - Each area's routes and queries live in `apps/api/src/features/<area>.ts`.
     - Shared helpers live in `core.ts`: `currentUser()`, `viewer()`, `coreSeat()`, `getMe()`, `completion()`, work cards and briefs.
     - Tables are in `schema.ts`; use `ADD COLUMN IF NOT EXISTS` for changes to existing tables.
     - Demo data is in `seed.ts`. `seedBuild()` runs once per database and is recorded in `seed_marks`.
   - **Roles in the demo:**
     - There are no passwords. The web app sends `x-vinden-as: <handle>` (or `visitor`), set by the Demo bar's "Viewing as" switch. Personas are listed in core.ts.
     - The API refuses writes from visitors, except sign-up, company registration and a manager confirming a role.
     - Use `isVisitor`, `isCompany`, `isMember` and `isCore` from components/Page.tsx.
   - **CSS:**
     - Shared rules go in `styles.css`; a feature's rules go in its `<area>.css`.
     - Order the blocks desktop base, then tablet, then phone.
     - Use the `--color-*` tokens.
     - No em dashes in UI copy.
   - **Figma limits:** you can't resize layers inside an instance. Bars that show data (the Contribution split) are detached on the screen; the Progress bar has Value variants. After swapping an icon in a Primary button, set the icon to `icon/inverse` again.
8. **Verify.** Run `npm run dev` and open http://localhost:5180 at 1440, 1024 or 834 (tablet) and 390 wide, in both themes (use the theme switch). Check each role through the Demo bar's "Viewing as" switch. Check keyboard focus and screen reader names, and run `npm run typecheck`. Design in Figma in both modes too: Screens / Dark holds the dark copies.
9. **Close the loop.** Set the Notion feature's status, and update any skill whose component changed.

## Branches

- `main` holds the released state.
- Feature work happens on branches. `Vinden-web` and `vinden-mob` are the web and mobile work streams for the Club and Post work screens. `vinden-mob` builds on `Vinden-web`, so merge `Vinden-web` first.
- `vinden-design` builds every screen in the feature register, responsive at desktop, tablet and phone sizes, on top of the dark theme and Harsh's card feedback.
- Commits explain why. Don't push to `main` without the team's approval.
