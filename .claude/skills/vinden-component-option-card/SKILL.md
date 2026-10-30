---
name: vinden-component-option-card
description: The Vinden Option card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a option card in Figma or code, for example: Kind of work, account type, verification path (manager email or offer letter).
---

# Option card (component)

One explained choice in a small radio group.

**Use it for:** Kind of work, account type, verification path (manager email or offer letter).

**Not for:** More than five options (use Chip), or several answers at once (use Checkbox).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Option card**: page Forms, node `44:212`.
  - Variants: State=Default|Selected.
  - Properties: Title (text), Description (text).
  - Colour tokens: action/primary, bg/selected, bg/surface, border/default, border/strong, text/primary, text/secondary.
  - Text styles: Title/Small, Body/Small.

## Rules

- Icon tile, title, one-line description, radio. Selected: navy 2 px border and navy-50 fill.
- Two columns on desktop, one on phones.

## In code

Paths are under `apps/web/src`.

- `<OptionCards legend name options value onChange error? />` from components/Forms.tsx: a `<fieldset>` of `<label className="option-card">` with visually hidden radios.

## Accessibility

- Native radio group: arrow keys move, and the legend names the group. A focus ring on the card.

Related skills: vinden-atom-text-field, vinden-atom-chip, vinden-visual-guidelines.
