---
name: vinden-component-community-card
description: The Vinden Community card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a community card in Figma or code, for example: Home's Communities section, the communities step in sign-up, a club page's community, or a communities list.
---

# Community card (component)

A community someone can follow: a Vinden Club's open community (events, announcements, recruitment updates) or a topic community. Platform and club communities are open; closed communities need admin approval.

**Use it for:** Home "Communities", the communities step in sign-up, a club's public page, a communities list.

**Not for:** Club membership. A Vinden Club is exclusive, with about 30 members chosen in recruitment, and following its community never makes someone a member (vinden-product, Flow 9).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Community card**: page Cards, Section / Community card, node `88:272`.
  - Variants: Status=Join|Joined|Request to join|Requested.
  - Properties: Name (text), Description (text), Identity (instance swap). The Meta line is a text override.
  - Colour tokens:
    - Card: bg/surface, border/default, text/primary, text/secondary and text/tertiary.
    - Banner and icon: `cover/<tone>/bg`, `soft` and `ink`.
    - Identity tile: Primitives white.
  - Text styles: Title/Card, Caption, Body/Small.
  - Buttons: Outline (Join, Request to join) and Quiet (Joined, Requested), Small.

## Anatomy

1. **Banner:** 64 px tall, in a cover tone, with two soft circles at the top right.
2. **Identity tile:** 48 px, radius 12, overlapping the banner at left 16.
   - It stays **white in both themes**, with a 2 px bg/surface ring, so the tone-ink icon keeps its contrast in dark mode.
   - Club communities show Logo / Tile; topic communities show a 24 px icon in the tone's ink.
3. **Name:** one line, ellipsis.
4. **Meta:** "Open · 1,240 members" or a lock and "Closed · 86 members". Club communities add the prefix "Club community · ".
5. **Description:** two lines max.
6. **Full-width small button,** pinned to the bottom so the buttons in a row line up.

## Rules

- **Statuses:**

  | Access | Before | After |
  |---|---|---|
  | Open | **Join** | **Joined** |
  | Closed | **Request to join** | **Requested** |

  A second click on Joined leaves; a second click on Requested cancels.
- Never use the Accent button: the card is not the screen's key action.
- Give each card in a row a different tone (the Cover tones, never Navy). A club community uses Lavender, the club colour.
- Desktop: four across in the card grid. Phone: a rail of 260 px cards.

## In code

Paths are under `apps/web/src`.

- `<CommunityCard community={c} />` from components/Cards.tsx. `useCommunities()` and `useJoinCommunity()` are in api.ts.
- API:
  - `GET /api/communities` returns each community with the viewer's `status`: none, joined or requested.
  - `POST /api/communities/:slug/join`: open becomes joined (+1 member); closed becomes requested.
  - `DELETE /api/communities/:slug/join` leaves or cancels.
  - Tables are `communities` and `community_members`, seeded by `seedCommunities()`.
- Buttons: `btn btn-outline btn-sm` for Join and Request to join; `btn btn-quiet btn-sm` for Joined and Requested.

## Accessibility

- The button's accessible name includes the community: "Join Product & Growth".
- Joined and Requested set `aria-pressed="true"`.
- The banner and tile are decorative (`aria-hidden`).
- The lock is paired with the word "Closed", so colour or icon is never the only cue.

Related skills: vinden-product, vinden-component-cover, vinden-atom-button, vinden-visual-guidelines.
