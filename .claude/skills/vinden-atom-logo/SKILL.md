---
name: vinden-atom-logo
description: The Vinden Logo atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a logo in Figma or code, for example: The site header, footer, club badges, empty states and the app icon.
---

# Logo (atom)

The Sunrise app tile, alone or with the lowercase "vinden" wordmark.

**Use it for:** The site header, footer, club badges, empty states and the app icon.

**Not for:** Product UI decoration, or anywhere the Horizon mark (marketing) belongs.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Logo / Tile**: page Logo, node `32:11`.
- **Logo / Lockup**: page Logo, node `32:14`.
  - Colour tokens: text/primary.
  - Text styles: Brand/Wordmark.
- **Logo / Lockup on dark**: page Logo, node `32:19`.
  - Colour tokens: text/inverse.
  - Text styles: Brand/Wordmark.

## Rules

- Use the Tile at 24 px minimum: 38 px in the header, 30 px in the footer, 44 to 72 px for club badges.
- Use the Lockup on light backgrounds and Lockup on dark on navy. Never retype the wordmark.
- Keep a quarter of the tile width clear on every side. Don't stretch, rotate, recolour or add effects.
- The tile is a 512 px PNG. Swap the image inside Logo / Tile when the vector arrives.

## In code

Paths are under `apps/web/src`.

- `<Logo size={38} />` (components/Bits.tsx) renders `/vinden-logo-sunrise.png`, with the radius at 26% of the size.
- `<Brand />` (components/Layout.tsx) is the lockup: tile plus `.wordmark` (Plus Jakarta Sans 800, −4% tracking).

## Accessibility

- Inside a home link, the link has the name ("Vinden home"); the image itself is decorative (`alt=""`).

Related skills: vinden-visual-guidelines, vinden-component-top-nav, vinden-visual-guidelines.
