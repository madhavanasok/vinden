---
name: vinden-component-feedback-note
description: The Vinden Feedback note component: what the club's reviewers asked for when they sent work back. Figma properties, tokens and the React FeedbackNote. Use when a Vinden screen shows reviewer feedback on Proof of Work.
---

# Feedback note (component)

What the club's Proof of Work & Quality reviewers asked for when they sent work back (register FN-05).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Club & training.
- **Feedback note**: node `112:216`.
  - Properties: From, Feedback (text).
  - Tokens: bg/club fill, text/club for the head, text/primary for the feedback, radius/2xl.
  - Text styles: Label/Small and Body/Default.

## Rules

- Shown only to the work's team: on its page and in its verification status.
- The feedback is the reviewer's words. Don't summarise them.
- Resubmitting after feedback isn't in the register yet.

## In code

- `<FeedbackNote feedback from? />` from `apps/web/src/components/Status.tsx`.

## Accessibility

- A `<section aria-label="Reviewer feedback">`.

Related skills: vinden-component-verification-row, vinden-component-ai-result.
