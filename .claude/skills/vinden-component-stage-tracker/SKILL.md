---
name: vinden-component-stage-tracker
description: The Vinden Stage tracker component: where one item is in fixed steps (club selection, problem statements), built from the Step atom. Figma variants and properties, rules, the React components and accessibility. Use when a Vinden screen shows one item's progress through fixed steps.
---

# Stage tracker (component)

Where one item is in fixed steps. Done steps have a tick, the current step is filled, and steps to come are outlined.

**Use it for:**
- **A club application:** Motivation form, Screening, Interview, Practical task, Final selection (PDF §2).
- **A problem statement:** Problem, Student team, Solution, Proof of Work (PDF §6).

**Not for:**
- Many items at once (use the Board).
- Form steps on Post work (use Step with Steps).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Club & training.
- **Stage tracker**: node `112:174`.
  - Variants: Layout=Row|Column.
  - Properties: Show fifth step (boolean). Turn it off and relabel for the four problem-statement stages.
  - It's built from Step instances (`44:182`, State=Done|Current|Upcoming), with border/default connectors.

## Rules

- Steps follow the sources' order. Never skip or add steps.
- An ended application shows every step as Upcoming, plus "Application ended". A selected one shows every step Done, plus "Selected".
- Row on desktop and tablet; Column on phones and in narrow side panels.

## In code

Paths are under `apps/web/src`.

- `<ApplicantSteps step layout="row|column" label />` from components/ApplicantSteps.tsx. It also exports `SELECTION_STEPS` and `STEP_LABEL`.
- `<ProblemStages stage label />` from components/ProblemStages.tsx. It also exports `PROBLEM_STAGES`.

## Accessibility

- An ordered list with `aria-current="step"` on the current step.
- Done steps add a hidden ", done".

Related skills: vinden-atom-step, vinden-component-board, vinden-product.
