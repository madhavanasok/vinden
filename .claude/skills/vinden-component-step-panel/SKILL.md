---
name: vinden-component-step-panel
description: The Vinden Step panel component: one question or short form per screen (sign-up, profile steps, add a role, apply to a club, create a community, register a company, submit a problem). Figma properties, tokens, the React StepScreen and accessibility. Use when a Vinden flow asks for one thing per screen.
---

# Step panel (component)

One question, or one short form, per screen.

**Use it for:** sign-up, each profile completion step, adding a role, applying to a club, creating a community, registering a company, submitting a problem statement.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Pages & boards.
- **Step panel**: node `112:328`.
  - Properties: Show skip (boolean).
  - Parts: the form panel (bg/surface, border/default, radius/3xl, 28 padding), with Text field instances to replace. Then the foot: Skip (Outline Large) and Save (Primary Large).

## Rules

- It sits under a Page header. Add a Progress bar with visible text when the step is part of a longer flow (the profile completion percentage).
- Skip comes before the submit button.
- The submit is Primary. Use Accent only when it's the screen's one key action (Send for verification).
- **Phone:** no panel frame; the buttons move to the Action bar, and the tab bar hides.

## In code

- `<StepScreen title eyebrow? sub? back? progress? primary secondary? error? onSubmit>` from `apps/web/src/components/StepScreen.tsx`.
- The tab bar hides on these routes through `OWN_ACTION_BAR` in components/Layout.tsx.

## Accessibility

- A real `<form>` that submits on Enter, with `aria-busy` while saving.
- Server errors use `role="alert"`.

Related skills: vinden-component-page-header, vinden-component-action-bar, vinden-atom-text-field.
