---
name: vinden-component-person-row
description: The Vinden Person row component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a person row in Figma or code, for example: Core Team, applicants, reviewers, shortlists, vouch requests.
---

# Person row (component)

One person in a list.

**Use it for:** Core Team, applicants, reviewers, shortlists, vouch requests.

**Not for:** Teammates while posting (Teammate row) or published team members (Member row).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Person row**: page Lists & data, node `46:156`.
  - Variants: Trailing=None|Pill|Button|Chevron.
  - Properties: Name (text), Line (text).
  - Colour tokens: text/primary, text/secondary, icon/secondary, plus nested Avatar, Pill, Button.
  - Text styles: Label/Default, Body/Small.

## Rules

- Avatar, name, one line of context (role, college or weight), then an optional trailing Pill, Button or Chevron.
- Rows stack with no dividers inside a card. The whole row links to the profile when there is no trailing button.

## In code

Paths are under `apps/web/src`.

- `<PersonRow person line to? trailing? />` from components/Rows.tsx (`.person-row`, inside `.person-list`).

## Accessibility

- One link per row. A trailing button is a separate control with its own label.

Related skills: vinden-atom-avatar, vinden-component-info-row, vinden-visual-guidelines.
