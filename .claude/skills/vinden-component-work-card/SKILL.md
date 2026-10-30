---
name: vinden-component-work-card
description: The Vinden Work card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a work card in Figma or code, for example: Home, Club, Profile, search results and the Post work preview.
---

# Work card (component)

A piece of Proof of Work in a grid or rail.

**Use it for:** Home, Club, Profile, search results and the Post work preview.

**Not for:** Briefs (use Brief card).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Work card**: page Cards, node `27:45`.
  - Properties: Title (text), Byline (text), Checks (text), Show checks (boolean).
  - Colour tokens: bg/surface, icon/default, text/primary, text/secondary, text/tertiary, trust/score.
  - Text styles: Title/Card, Label/Small, Body/Small, Caption.

## Rules

- Order: cover, title (two lines max), vouch score, who made it, then the checks passed ("AI checked · Club verified").
- Never hide the checks line to save space.
- The whole card links to the work. Save is a separate Floating icon button.
- On a profile, the byline becomes the kind of work.
- Work without a preview image gets a Generated cover (kind, file type and title on a tone from the work); see vinden-component-cover. Neighbouring cards never share a tone, and never Navy. In Figma the default cover is Blue; override the tone per card.

## In code

Paths are under `apps/web/src`.

- `<WorkCard work owner? />` and `<WorkCardPreview title cover byline />` (no link, save or score) from components/Cards.tsx.

## Accessibility

- One link per card (the card body); Save is its own button with `aria-pressed`.

Related skills: vinden-atom-vouch-score, vinden-component-cover, vinden-visual-guidelines.
