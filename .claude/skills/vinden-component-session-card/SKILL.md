---
name: vinden-component-session-card
description: The Vinden Session card component: one alumni or industry session from the club's training program. Figma properties, tokens, the React SessionCard and accessibility. Use when a Vinden screen lists club sessions.
---

# Session card (component)

One session the Core Team organises (PDF §3C–D):
- **Alumni session:** career journeys, the skills that matter, building a portfolio.
- **Industry session:** a professional brings a real problem and guides members through solving it.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Club & training.
- **Session card**: node `112:178`.
  - Properties: Kind (text: ALUMNI SESSION or INDUSTRY SESSION), Title, When, Body (all text).
  - Parts: a Gold Icon tile with a calendar, Overline, Heading/H4, a clock with Label/Small, Body/Small.
  - Tokens: bg/surface, border/default, radius/2xl, space/20 padding.

## Rules

- Group cards under their kind. Drop the "Alumni session:" prefix from titles under that heading.
- **Desktop and tablet:** two across. **Phone:** one column.

## In code

- `<SessionCard id kind title when body />` from `apps/web/src/components/SessionCard.tsx`, on `/club/sessions`.

## Accessibility

- An `<article>` with an h3 title. The tile is decorative.

Related skills: vinden-atom-icon-tile, vinden-product.
