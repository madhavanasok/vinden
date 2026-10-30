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

Every screen comes from the feature register (`docs/vinden-feature-register-v0.1.html`). The code after each route is its register item. Routes are in `apps/web/src/App.tsx`.

| Area | URL | Who | Register |
|---|---|---|---|
| Home | `/` | Everyone | FN-07-I01: completion bar, then verified work |
| Explore | `/explore` (`?q=`, area filter) | Everyone, signed in or not | FN-07-I02 |
| Sign up | `/signup` | Visitors | FN-01-I01: email only, then straight to Home |
| Profile steps | `/profile/complete/describe`, `college`, `communities`, `skills` | People | FN-02-I03 to I06, opened from the completion bar |
| Profile | `/people/:handle` | Everyone; public link | FN-02-I01 |
| Add experience | `/profile/experience/new` | People | FN-03-I01 |
| Confirm a past role | `/confirm/:token` | Managers, no sign-in, no app chrome | FN-03-I02 |
| Post Proof of Work | `/post` (`?task=` links a club task) | People | FN-04-I01 |
| Proof of Work | `/work/:slug` | Everyone; public link | FN-06-I01, with verification status for the team (FN-05-I01) |
| Communities | `/communities`, `/communities/new`, `/communities/:slug`, `/communities/:slug/requests` | Everyone browses; people join; admins approve | FN-08-I01 to I04 |
| Club | `/club` (yours), `/clubs/:slug`, `/clubs/:slug/portfolio`, `/clubs/:slug/apply` | Everyone sees a club; students apply | FN-09-I01, I02, FN-10-I01 |
| Core Team tools | `/club/review`, `/club/review/:slug`, `/club/completion`, `/club/applications`, `/club/applications/:id`, `/club/problems` | Core Team | FN-05-I02 to I04, FN-10-I02, I03, FN-12-I03 |
| Training program | `/club/training`, `/club/learning/:id`, `/club/tasks/:id`, `/club/sessions` | Club members; the Core Team adds to it | FN-11-I01 to I04 |
| Companies | `/companies/register`, `/problems`, `/problems/new` | Companies | FN-12-I01, I04, I02 |

Every page has one stable URL that works on every device. Never create phone-only or desktop-only URLs, because Proof of Work and profile links get shared on WhatsApp and LinkedIn. Screens that depend on an open question (R-xx in the register) keep the most reversible behaviour.

## Navigation

Navigation itself isn't decided in the sources; this follows the register's areas, by account.

| Account | Desktop and tablet top nav | Main action | Phone tab bar |
|---|---|---|---|
| Person | Explore, Communities, Club (club members) | Post work | Explore, Communities, Post, Club (members), Profile |
| Company | Explore, Problem statements | Submit a problem | Explore, Problems, Submit |
| Visitor | Explore, Communities | Sign up (and For companies on desktop) | Explore, Communities, Sign up |

- **Desktop (1,100 px and up):** the top bar with the logo, search (not on Home or Explore), the nav links, the main action, the theme switch and the avatar.
- **Tablet (768 to 1,099 px):** the same top bar, without search (it lives on Explore) and without the For companies link.
- **Phone:**
  - A top bar with the logo, the theme switch and the avatar (or Sign up). Sub-pages use a back arrow and the title instead (Page header).
  - The floating tab bar holds the top-level areas.
  - Flows with their own Action bar hide it.
- **Active state:** Explore stays active for Home, Explore, any work page and other people's profiles; Club stays active for `/club/*` and `/clubs/*`.
- **The Demo bar ("Viewing as") is demo-only.** It sits above everything at every size, so each role can be tried. It is not part of the product.

## Page templates and their hierarchy

**Home:** only what the register lists (open question R-23 asks what else Home shows).
1. Greeting and a search box that goes to Explore.
2. Complete your profile: the progress bar and the missing steps (hidden when complete).
3. Verified work.

Desktop: a grid of four. Tablet: two or three columns. Phone: a rail.

**Every other new screen:**
1. Page header (eyebrow, h1, one line, actions).
2. The register's "Must contain" items, in order.
3. An empty state where a list can be empty.

Role-only screens are wrapped in a Gate that explains who they're for.

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

**Club (`/clubs/:slug`):** built from the operating-model PDF.
1. Club identity: name and college.
2. Core Team by role: Club President / Chapter Lead 1, Learning & Development 4, Industry & Outreach 2, Proof of Work & Quality 2, Community & Events 2, Partnerships & Strategy 1, Social Media & Communications 1.
3. Members (about 30).
4. Portfolio: every project the club has done.
5. The club's community (Join). It offers the community, not membership.
6. For members: training and sessions. For the Core Team: the tools panel (review queue, completion, applications, training plan, problem statements). While recruiting, non-members see Apply.

Desktop: main column plus a side column. Tablet: the side column wraps below. Phone: one column.

**Post work (a form flow):** four steps.
1. What you made.
2. Who did what.
3. Skills and visibility.
4. Review and send.

Desktop: all steps on one page, with a step row at the top and a sticky side summary (live card preview, what happens next, Send for verification). Phone: one step per screen, with a progress bar and an action bar (Back, Continue).

## Turning desktop into tablet and phone (apply in this order)

**Tablet first:** keep the desktop structure, drop to 24 px gutters and two or three columns, and wrap side panels below the main column when they no longer fit. Then for phone:

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
