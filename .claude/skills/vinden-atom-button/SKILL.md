---
name: vinden-atom-button
description: The Vinden Button atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a button in Figma or code, for example: Any action, or a navigation link that should look like an action (Post work, View brief).
---

# Button (atom)

The pill button for actions.

**Use it for:** Any action, or a navigation link that should look like an action (Post work, View brief).

**Not for:** Filters (use Chip), toggling a saved state on cards (use Icon button), or inline links in text.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Button**: page Buttons, node `20:107`.
  - Variants: Style=Primary|Accent|Outline|White|Quiet; Size=Small|Medium|Large; State=Default|Disabled.
  - Properties: Label (text), Show icon (boolean), Icon (instance swap).
  - Colour tokens: action/accent, action/primary, action/secondary, bg/subtle, bg/surface, text/inverse, text/on-accent, text/primary.
  - Text styles: Label/Small, Label/Default, Label/Large.

## Rules

- **Primary** (navy) is the main action. **Accent** (orange) is the one trust action on a screen: Vouch for this work, View brief, Send for verification. Never put two Accent buttons side by side.
- **Outline** is for secondary actions. **White** goes on navy or on images.
- **Quiet** (bg/selected, no border) shows a choice the person has already made and can undo: Joined, Requested. Pair it with `aria-pressed`. Never use it for the main action.
- Small 38 px, Medium 44 px, Large 50 px. Use Large in action bars and side panels.
- Labels are sentence case, start with a verb and say what happens.
- Disabled: only when the reason is visible nearby. Prefer validating on press and showing the error.

## In code

Paths are under `apps/web/src`.

- `className="btn btn-primary|btn-accent|btn-outline|btn-white|btn-quiet"`, plus `btn-sm|btn-lg` and `btn-block` for full width.
- Use `<button type="button">` for actions, `<Link className="btn …">` for navigation, `type="submit"` in forms.
- Icons: `<Icon name="plus" size={18} strokeWidth={2} />` before the label.

## Accessibility

- 44 px minimum height (Small is 38 px: use it only where neighbours give 44 px of hit area).
- Pressed toggles (Save) use `aria-pressed`.

Related skills: vinden-atom-icon-button, vinden-component-action-bar, vinden-visual-guidelines, vinden-visual-guidelines.
