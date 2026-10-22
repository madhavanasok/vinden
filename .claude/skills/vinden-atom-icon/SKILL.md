---
name: vinden-atom-icon
description: The Vinden Icon atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a icon in Figma or code, for example: Pairing with a label in buttons, rows, meta lines and navigation.
---

# Icon (atom)

The 34 line icons on a 24 px grid: 1.8 px stroke, round caps and joins.

**Use it for:** Pairing with a label in buttons, rows, meta lines and navigation.

**Not for:** Decoration with no meaning, or as the only label of a control unless it has an aria-label.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- Page **Icons**, one component per icon named `Icon/<Name>`: Search, Bell, Compass, Bookmark, Plus, Plus square, Users, Briefcase, User, Chevron right/left/down, Arrow left, Share, Info, Trending up, Thumbs up, Trophy, Calendar, Clock, File, Graduation, Sparkle, Shield check, Building, Lock, Map pin, Link, Sliders, Check, More, Verified, Upload, Close.
- Strokes are bound to `color/icon/default`. Override to `icon/inverse` on navy and inside Primary buttons. **After an instance swap, set the colour again**, because a swap resets it.

## Rules

- 20 px inside text rows and buttons, 22 px in navigation, 16 px in meta lines.
- Colour follows meaning: `icon/trust` on trust tints, `icon/club` on club tints, `icon/success` for confirmations.
- Verified is the only filled icon (the blue tick). Use it only for checks that passed.
- New icons follow the same grid and stroke. Add them to Figma and to `Icon.tsx` together.

## In code

Paths are under `apps/web/src`.

- `<Icon name="search" size={20} />` from `components/Icon.tsx`. Names are camelCase (`chevronRight`, `plusSquare`, `upload`, `close`).
- `<CheckBadge size={16} label?>` for the blue verified tick.
- Icons are `aria-hidden` by default; the label belongs to the parent control.

## Accessibility

- Icon-only buttons need `aria-label` ("Save", "Remove survey.xlsx").
- Never rely on an icon alone to say something passed; pair it with words.

Related skills: vinden-atom-icon-button, vinden-atom-icon-tile, vinden-atom-button, vinden-visual-guidelines.
