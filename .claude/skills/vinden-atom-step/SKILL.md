---
name: vinden-atom-step
description: The Vinden Step atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a step in Figma or code, for example: Post work, onboarding, applying to a club, submitting a brief.
---

# Step (atom)

One step marker in a multi-step form.

**Use it for:** Post work, onboarding, applying to a club, submitting a brief.

**Not for:** Navigation between pages (use tabs).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Step**: page Forms, node `44:182`.
  - Variants: State=Done|Current|Upcoming.
  - Properties: Number (text), Label (text).
  - Colour tokens: action/primary, bg/surface, border/strong, icon/inverse, text/inverse, text/primary, text/secondary, text/tertiary, trust/score.
  - Text styles: Label/Small.

## Rules

- **Done**: blue tick. **Current**: navy number. **Upcoming**: outlined number. Connect markers with a 40 px line.
- On desktop, a row of steps above a form that shows every step at once; clicking a step scrolls to its section.
- On phones, hide the row. Show a Progress bar plus "Step 2 of 4" in the Mobile top bar, one step per screen.

## In code

Paths are under `apps/web/src`.

- `<Steps steps current done onSelect />` from components/Forms.tsx renders an `<ol className="steps desktop-only">`.

## Accessibility

- `aria-current="step"` marks the current step, and done steps add a hidden ", done".

Related skills: vinden-atom-progress-bar, vinden-component-action-bar, vinden-visual-guidelines.
