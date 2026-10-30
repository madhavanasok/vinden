---
name: vinden-component-ai-result
description: The Vinden AI result component: what the AI check reported for one piece of Proof of Work, row by row. Figma properties, tokens, the React AiResult and accessibility. Use when a Vinden screen shows the AI check's findings (review screen, verification status).
---

# AI result (component)

What the AI check reported for one piece of work: a blue tick for what passed, and a lavender info mark for what a reviewer should look at.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Club & training.
- **AI result row**: node `112:227`.
  - Properties: Label, Detail (text), Passed (boolean), To look at (boolean). Turn on exactly one of the two.
  - Tokens: trust/score for the tick, icon/club for the flag, text/primary and text/secondary.
  - Text styles: Title/Small and Body/Small.
  - Rows stack with border/subtle dividers.

## Rules

- The AI check is simulated in the demo: it always passes, and its signals come from what was posted.
- The order of the AI check and club review is open (R-09). Show them as a list, never as a timeline.

## In code

- `<AiResult signals={[{ label, detail, ok }]} />` from `apps/web/src/components/Status.tsx`. The same file has `VerificationList`, `StatusRow`, `StatusPill` and `FeedbackNote`.

## Accessibility

- Each label adds a hidden ": passed" or ": to look at", so colour isn't the only cue.

Related skills: vinden-component-verification-row, vinden-component-feedback-note.
