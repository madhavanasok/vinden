---
name: vinden-information-architecture
description: Vinden's sitemap, navigation, URL structure and the information hierarchy of every page type (what comes first, second, third on desktop and phone). Use when planning a new screen, deciding what goes above the fold, adding navigation, or adapting a desktop layout for the phone.
---

# Vinden information architecture

## The one hierarchy rule

On every surface, show **the work first, trust second, people third, actions last**:
- **Work:** cover, then title.
- **Trust:** score, checks, and who verified it.
- **People:** who made it and who vouched.
- **Actions:** save, vouch, share.

The exception is the single most important action on a page, such as "Vouch for this work", "Send for verification" or "View brief". It gets the one Accent button and stays reachable without scrolling: in a side panel on desktop, a sticky action bar on phones.

## Sitemap and URLs

| Area | URL | Who | Purpose |
|---|---|---|---|
| Explore (Home) | `/` with `?category=`, `?view=briefs`, `?q=` | Everyone | Your next step, your club's task, live briefs, verified work |
| Proof of Work | `/work/:slug` | Everyone; public link | The work, checks, who did what, vouches |
| Profile | `/people/:handle` | Everyone; public link | Identity, verified work, experience, journey |
| Club | `/club` (yours), later `/clubs/:slug` (public) | Members, Core Team | This week's task, live briefs, Core Team, sessions, club stats |
| Post work | `/post` (optionally `?task=` or `?brief=`) | Account holders | Flow 2 form: describe, team and split, skills, review and send |
| Openings | `/openings` | Students and pros | Roles and internships (not designed yet) |
| Saved | `/saved` | Everyone signed in | Saved work and briefs |
| Brief | `/briefs/:slug` (planned) | Club members, company | Scope, fee to club, team, timeline |
| For companies | marketing site | Company admins | Submit a problem statement (Flow 7) |

Every page has one stable URL that works on every device. Never create phone-only or desktop-only URLs, because Proof of Work and profile links get shared on WhatsApp and LinkedIn.

## Navigation

- **Desktop (768 px and up):** a top bar with the logo, search (not on Home, which has its own hero search), and nav links Explore, Club, Openings, Saved. Then a "Post work" Primary button, notifications and your avatar. Home adds a category row (For you, Business, Design, Data, Research, Problem statements).
- **Phone:** a top bar with the logo, notifications and your avatar. Sub-pages use a back arrow and title instead. A floating tab bar holds Explore, Club, Post, Openings and Profile. Saved moves to the profile, and Post moves into the tab bar.
- **Active state:** Explore stays active for Home, any work page and other people's profiles. Profile is active only on your own profile.

## Page templates and their hierarchy

**Explore (Home):**
1. Greeting and search.
2. Your journey (profile strength, next step, vouch requests).
3. Your club's task this week.
4. Live problem statements.
5. Verified work grid.

Desktop: grids of four. Phone: horizontal rails.

**Proof of Work:**
1. Cover or gallery.
2. Title, badge (PAID BRIEF, CLUB TASK), and score.
3. Checks line.
4. Tabs (Overview, Verification, Team, Vouches).
5. Who did what.
6. Vouches sorted by weight.

Desktop: a side panel with the vouch action. Phone: a sticky action bar.

**Profile:**
1. Avatar with the sunrise ring, name, headline, club role.
2. Stats (work, vouches, roles verified).
3. Milestones.
4. Verified work.
5. Experience with its verification badge.
6. Journey timeline.

Desktop: identity in a sidebar. Phone: one column.

**Club:**
1. Club identity: name, college, members, Core Team size.
2. Club stats: earned by the club, work verified, live briefs.
3. This week's task, with progress and the Post your work action.
4. Live problem statements.
5. Recently verified club work.
6. The Core Team by role.
7. Next session.

Desktop: main column plus a side column for the Core Team and the session. Phone: one column, with briefs as a rail.

**Post work (a form flow):** four steps.
1. What you made.
2. Who did what.
3. Skills and visibility.
4. Review and send.

Desktop: all steps on one page, with a step row at the top and a sticky side summary (live card preview, what happens next, Send for verification). Phone: one step per screen, with a progress bar and an action bar (Back, Continue).

## Turning desktop into phone (apply in this order)

1. Grids of cards become horizontal rails (cards 260 to 300 px), except the main list of a page, which becomes one column.
2. Side columns move below the main column, unless they hold the main action. That action moves to a sticky action bar.
3. Tabs stay, but scroll horizontally.
4. Long forms split into steps.
5. The top nav becomes the tab bar.
6. Nothing is removed. Every fact on desktop is reachable on the phone.

## States every page needs

- **Loading:** spinner and "Loading…".
- **Error:** what happened plus Try again.
- **Not found:** "There's nothing at this link."
- **Empty:** points to the next step, e.g. "No work yet. Post your first Proof of Work."

Components for these live in `apps/web/src/pages/Placeholder.tsx`.

Related skills: vinden-product, vinden-visual-guidelines, vinden-build-feature.
