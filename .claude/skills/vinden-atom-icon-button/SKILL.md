---
name: vinden-atom-icon-button
description: The Vinden Icon button atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a icon button in Figma or code, for example: Save, Share, notifications, remove a file or teammate, back.
---

# Icon button (atom)

A 44 × 44 round button with only an icon.

**Use it for:** Save, Share, notifications, remove a file or teammate, back.

**Not for:** Primary actions; anything people might not recognise from the icon alone.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Icon button**: page Buttons, node `20:131`.
  - Variants: Style=Outline|Bare|Floating.
  - Properties: Icon (instance swap).
  - Colour tokens: bg/subtle, bg/surface, border/default, icon/default.

## Rules

- **Outline** on surfaces, **Bare** inside bars and rows, **Floating** over covers and images (uses Shadow/On image).
- One icon, no text. If it needs explaining, use a Button with a label.

## In code

Paths are under `apps/web/src`.

- `<button className="icon-btn" aria-label="…">` with `.bare` for Bare. Cards use `SaveButton` (`.save-btn`) in components/Cards.tsx.

## Accessibility

- Always set `aria-label`. Toggles add `aria-pressed`.
- Notification count goes in the label: "Notifications, 2 new".

Related skills: vinden-atom-icon, vinden-atom-button, vinden-visual-guidelines.
