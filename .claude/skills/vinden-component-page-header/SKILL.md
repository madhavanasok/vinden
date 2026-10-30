---
name: vinden-component-page-header
description: The Vinden Page header component: the top of every screen (eyebrow, h1, one line of context, actions) at desktop, tablet and phone sizes, its Figma variants and properties, the React Page frame and accessibility. Use when a Vinden screen needs its title area, in Figma or code; every new screen should be built inside it.
---

# Page header (component)

The top of every screen: an eyebrow saying where you are, the page's h1, one line of context, and the page's actions.

**Use it for:** every screen built from the feature register (sign-up and profile steps, communities, club tools, training, problem statements).

**Not for:** Home and the Proof of Work page, which have their own hero layouts.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Page header**: page Pages & boards, node `107:146`.
  - Variants: Size=Desktop|Phone.
  - Properties: Eyebrow (text), Title (text), Sub (text), Show eyebrow (boolean), Show sub (boolean), Show actions (boolean).
  - Colour tokens: text/primary, text/secondary, text/tertiary.
  - Text styles: Overline (eyebrow), Heading/H1 (desktop title) or Heading/H2 (phone), Body/Large (desktop sub) or Body/Default (phone).
  - Actions are Button instances (Outline and Primary, Medium).

## Rules

- **Desktop (1,100 px and up):** the text on the left, actions on the right, bottom-aligned.
- **Tablet (768 to 1,099 px):** the same, with the title at 34 px. Actions wrap below when they don't fit.
- **Phone:**
  - The Mobile top bar (Page type) sits above it with back and the title.
  - The title is H2, and the actions go full width below.
  - A flow's main action moves to the Action bar.
- One h1 per page. Keep the sub to one line of context.
- At most one Accent button among the actions.

## In code

Paths are under `apps/web/src`.

- `<Page title eyebrow? sub? actions? back? top? width?>` from components/Page.tsx wraps the whole screen. It renders the phone bar (`PageBar` with back, or `MobileBar` when `top`), the `.container .page` frame and the header.
- `width="narrow"` gives the 720 px frame for forms and single steps; the default is wide.
- CSS: `.page`, `.page-head`, `.page-title`, `.page-sub`, `.page-actions`, `.page-section`.

## Accessibility

- The title is the page's only h1.
- Back is a button labelled "Back".

Related skills: vinden-component-mobile-top-bar, vinden-component-action-bar, vinden-atom-button, vinden-information-architecture.
