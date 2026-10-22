---
name: vinden-atom-checkbox
description: The Vinden Checkbox atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a checkbox in Figma or code, for example: Confirming the work is yours, agreeing to terms, opt-ins.
---

# Checkbox (atom)

A yes or no the person decides.

**Use it for:** Confirming the work is yours, agreeing to terms, opt-ins.

**Not for:** Choosing one of several options (use Option card), or switching settings on and off.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Checkbox**: page Forms, node `44:168`.
  - Variants: State=Unchecked|Checked.
  - Properties: Label (text).
  - Colour tokens: action/primary, bg/surface, border/strong, icon/inverse, text/primary.
  - Text styles: Body/Default.

## Rules

- Never pre-ticked for consent.
- The whole row is the 44 px target, and the label wraps.

## In code

Paths are under `apps/web/src`.

- `<Checkbox checked onChange>label</Checkbox>` from components/Forms.tsx: a real `<input type="checkbox">` that is visually hidden, plus `.checkbox-box`.

## Accessibility

- Native checkbox semantics and keyboard support; a focus ring on the box.

Related skills: vinden-atom-text-field, vinden-visual-guidelines.
