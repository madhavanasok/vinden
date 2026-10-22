---
name: vinden-atom-text-field
description: The Vinden Text field atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a text field in Figma or code, for example: Titles, names, descriptions, roles, any typed answer.
---

# Text field (atom)

A labelled single-line or multiline input.

**Use it for:** Titles, names, descriptions, roles, any typed answer.

**Not for:** Choosing between a few known options (use Option card or Chip).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Text field**: page Forms, node `44:159`.
  - Variants: State=Empty|Filled|Focused|Error|Disabled; Type=Single line|Multiline.
  - Properties: Label (text), Value (text), Show helper (boolean).
  - Colour tokens: bg/subtle, bg/surface, border/default, border/error, border/focus, border/strong, text/error, text/primary, text/secondary, text/tertiary.
  - Text styles: Label/Small, Body/Large, Caption.

## Rules

- The label always sits above the field; the placeholder is only an example.
- Input text is Body/Large (17 px) so iOS never zooms on focus.
- Multiline is for descriptions (5 rows, grows). Helper text says what good looks like.
- Errors appear after the person tries to continue. They use the red border plus text that says how to fix it.
- States: Empty, Filled, Focused (2 px blue plus a 3 px ring), Error, Disabled.

## In code

Paths are under `apps/web/src`.

- `<TextField label value onChange multiline? helper? error? />` from components/Forms.tsx (`.field`, `.field-label`, `.field-input`, `.field-help`).

## Accessibility

- `<label htmlFor>` is wired up. Helper and error text are linked with `aria-describedby`, and `aria-invalid` is set on error.

Related skills: vinden-atom-checkbox, vinden-component-option-card, vinden-build-feature, vinden-visual-guidelines.
