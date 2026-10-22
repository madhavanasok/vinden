---
name: vinden-component-cover
description: The Vinden Cover component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a cover in Figma or code, for example: Work cards, brief cards, the work page gallery.
---

# Cover (component)

The preview of a piece of work at the top of its card or page.

**Use it for:** Work cards, brief cards, the work page gallery.

**Not for:** Decoration or stock imagery.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Cover**: page Cards, node `27:41`.
  - Variants: Tone=Navy|Blue|Lavender|Gold|Orange.
  - Colour tokens: bg/inverse-raised, bg/trust, bg/club, bg/highlight, bg/warm, split/2, split/3, split/4, trust/score.

## Rules

- The cover shows the work itself: a chart, screens, a slide. In the product it is generated from the upload.
- Tone hints at the kind of work (Navy for reports, Blue for data, Lavender for design, Gold for briefs, Orange for decks). It says nothing about quality.

## In code

Paths are under `apps/web/src`.

- `<Cover variant="cac" />` from components/Cover.tsx. Demo variants: activation-line, banking-table, cac, cafe-prices, canteen-bars, checkin-phone, hostel-donut, kyc-funnel, laundry-deck, library-phones, retention-curve, tam-circles.

## Accessibility

- Real covers need alt text that describes the work ("Funnel chart from the Snackly CAC teardown").

Related skills: vinden-component-work-card, vinden-component-brief-card, vinden-visual-guidelines.
