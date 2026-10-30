---
name: vinden-component-task-card
description: The Vinden Task card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a task card in Figma or code, for example: Club page (This week) and the Home club card.
---

# Task card (component)

This week's club task, with its progress and the action that completes it.

**Use it for:** Club page (This week) and the Home club card.

**Not for:** Paid briefs (use Brief card).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Task card**: page Cards, node `46:207`.
  - Properties: Title (text), Description (text), Due (text), Progress label (text).
  - Colour tokens: bg/surface, border/default, progress/fill, progress/track, text/primary, text/secondary, text/tertiary.
  - Text styles: Overline, Caption, Title/Card, Body/Small, Label/Small.

## Rules

- Order: CLUB TASK badge with the due date and effort, then the title, a one-line brief, the progress bar with "12 of 30 members posted", the avatar stack, and Post your work.
- Posting Proof of Work marks the task done, so the button opens `/post?task=this-week` with the task pre-filled.

## In code

Paths are under `apps/web/src`.

- `<TaskCard task />` from components/Cards.tsx. Home's `ClubCard` still has its own task markup; switch it to TaskCard when Home is next touched.

## Accessibility

- The progress bar has a label; the avatar stack has a sentence label.

Related skills: vinden-atom-progress-bar, vinden-atom-avatar-stack, vinden-product, vinden-visual-guidelines.
