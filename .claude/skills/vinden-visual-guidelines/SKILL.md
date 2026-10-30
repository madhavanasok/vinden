---
name: vinden-visual-guidelines
description: Vinden's visual language: colour tokens and their meanings, typography, spacing, radius, elevation, grid, icons, covers, logo use, voice and tone, and accessibility rules. Use whenever you choose a colour, font size, spacing value or wording for a Vinden screen, in Figma or in code.
---

# Vinden visual guidelines

Source of truth is the Figma file **Vinden-Design** (file key `zFjDhV7CDaLDVZpqN3dBzU`): https://www.figma.com/design/zFjDhV7CDaLDVZpqN3dBzU/Vinden-Design

| What | Where in Figma |
|---|---|
| Principles, rules, voice | Guidelines page |
| Tokens | Color, Typography and Layout pages |
| Variables | Primitives, Color and Layout collections |
| Text styles | 22 styles |
| Shadows | Shadow/* effect styles |

In code, tokens are CSS custom properties in `apps/web/src/styles.css`:
- **Semantic tokens** are `--color-*`, with the same names as the Figma code syntax (`color/text/primary` becomes `--color-text-primary`). Use these in new CSS.
- **Primitives** (`--navy`, `--ink-2`, `--blue-700`…) back the semantic tokens and the older rules.

## Principles (in priority order)

1. The work is the hero.
2. Trust at a glance.
3. Brand colour with restraint.
4. Familiar, not generic.
5. One system, two screens.
6. A journey, not a profile.

## Colour: two tiers

- **The brand palette is for the logo, marketing and celebration only.** Night Navy #07142F, Horizon Blue #1565D8, Dawn Orange #F7841E, Sun Gold #FFD23F, Dusk Lavender #B7A4F2 and Morning Cream #FDFBF6.
- **The product UI uses semantic tokens** (`color/…`), never primitives or raw hex.

Navy and cream carry every screen. Each other colour has one meaning:

| Meaning | Tokens (primitive → CSS) | Use |
|---|---|---|
| Text | text/primary navy/900 `--navy` · text/secondary navy/600 `--ink-2` · text/tertiary navy/500 `--ink-3` | All running text |
| Surfaces | bg/page cream/50 `--cream` · bg/surface white · bg/subtle cream/100 `--cream-2` · border/default cream/300 `--line` · border/subtle cream/200 `--line-soft` | Pages, cards, dividers |
| Main action | action/primary navy/900 | Primary buttons, selected chips |
| The one key action | action/accent orange/400 `--orange-400` with text/on-accent navy | Vouch for this work, View brief, Send for verification. **One per screen.** |
| Trust | trust/score blue/500 `--blue` · bg/trust blue/50 · text/trust blue/700 `--blue-700` | Scores, verified ticks, verification, focus ring |
| Club | bg/club lavender/100 `--lav-100` · text/club lavender/700 `--lav-700` | Club cards, Core Team, club review |
| Progress | bg/highlight gold/100 · bg/highlight-strong gold/200 · progress/fill gold/500 | Milestones, task progress, For companies band |
| Warm | bg/warm orange/100 · text/warm orange/700 | Fee pills, orange avatars |
| Feedback | success green/700 on green/50 · error red/700 on red/50 | System messages only |
| Inverse | bg/inverse navy/900 · text/inverse white · text/inverse-muted navy/200 | Navy bands, footer, editorial |

- **Cover tones (a third, separate set):** eight light tones for covers and community banners: Blue, Teal, Mint, Gold, Peach, Rose, Lavender and Stone. Navy is for editorial banners only.
  - Each tone has bg, mark, soft and ink values (the Figma **Cover** collection, CSS `--cover-<tone>-*`).
  - They are pictures, not UI, so they never carry meaning and never change with the theme.
  - Spread them so neighbouring cards differ.
  - See vinden-component-cover for the values.
- **Text contrast:** only navy and the 700 steps are text colours on light backgrounds; all of them pass WCAG AA. Orange, gold and lavender at brand strength are fills, never text on cream. On navy, everything passes except Horizon Blue.
- **Gradients** appear only in the logo, the profile ring and one editorial banner.

## Dark theme

Every Color token has a Light and a Dark value: two modes in the Figma Color collection, and two blocks of `--color-*` values in `styles.css`. Design and build with tokens only, and both themes follow automatically.

- **What changes in Dark:**
  - Night Navy (navy/900) is the page; cards rise one step to navy/800; muted panels sit at navy/850.
  - Text is Morning Cream, navy/200 and navy/300. The primary action turns cream with navy text.
  - Each tint becomes a deep version of its hue (blue/900, lavender/900, gold/900, orange/900, green/900, red/900), with the 200/300 step for its text.
  - Orange stays the one key action; trust blue and focus move to blue/400.
- **What stays the same:**
  - Covers and community banners, because they are pictures of the work. They use the single-mode Cover collection in Figma and `--cover-*` tokens, which the dark block doesn't redefine, in code.
  - The community card's identity tile stays white.
  - The logo, the sunrise gradients, the editorial band (which gets a 1 px edge in dark) and white controls that float over covers.
- **Contrast:** all dark text pairs pass AA. The lowest is error text on its tint at 6.1:1. Input borders and the focus ring are 4.5:1.
- **Choosing the theme:**
  - The theme switch (Moon or Sun icon button) is in the Top nav and the Home-type Mobile top bar.
  - It sets `data-theme` on `<html>` and saves the choice as `vinden.theme`. Without a saved choice, `prefers-color-scheme` decides.
  - `index.html` applies a saved choice before first paint and sets the browser toolbar colour.
- **In Figma:** show a dark frame by setting the Color collection's mode on it (Appearance in the right panel). Screens / Dark has the dark versions; Color > Dark theme has the previews and the dark token grid.
- **Never** hard-code colours or make separate "dark" tokens. If something looks wrong in Dark, it is bound to a primitive or a hex value; rebind it to a token.

## Typography

Always apply a text style. Never set size or weight by hand.

**Plus Jakarta Sans** (display and numbers):
- Display/Hero 56
- Display/Mobile 36
- H1 40, H2 28, H3 22, H4 18
- Title/Card 17, Title/Small 15
- Figure/Large 40

**DM Sans** (body and UI):
- Body/Large 17/27, Body/Default 15/22, Body/Small 14/20
- Caption 13/18: the floor for running text
- Labels 16, 15 and 14
- Label/Pill 13
- Label/Tab 11: tab bar only
- Overline 12 caps

**Instrument Serif Italic**: Accent/Serif 21, once per screen at most ("Not a profile. A journey.").

**On phones:** page titles step down one level (H1 to H2, H2 to H3). Form inputs use 16 px or more (Body/Large) so iOS Safari doesn't zoom on focus.

## Space, shape, depth

- **Spacing:** a 4 px base, using space/4, 8, 12, 16, 20, 24, 32, 40, 48 and 64.
  - Card padding: 16 on phone, 20 on desktop.
  - Between sections: 40 on phone, 48 on desktop.
- **Radius:**
  - sm 4: progress bars, small marks
  - md 8
  - lg 12: icon tiles
  - xl 14: compact cards
  - 2xl 16: cards, vouches, panels
  - 3xl 20: large panels
  - 4xl 24: editorial bands
  - full: buttons, chips, pills, avatars, search
- **Elevation:** soft, navy-tinted shadows.
  - Shadow/Card for cards on cream.
  - Shadow/Raised for hover.
  - Shadow/Float for the tab bar, sticky bars and sheets.
  - Shadow/On image for controls over covers.
  - Most surfaces are flat, with a 1 px border instead.
- **Grid:** one breakpoint at 768 px.

  | | Desktop | Phone |
  |---|---|---|
  | Container | 1,200 px content (`--gutter: 32px`) | Full width |
  | Gutter | 32 px | 18 px |
  | Card grid | auto-fill, min 250 px; gaps 20 px columns, 28 px rows | Rails or one column |
  | Text block | 760 px max | Full width |

- **Touch targets** are at least 44 × 44 px, with 8 px between neighbours.

## Icons, covers, logo

- **Icons:** 32 line icons on a 24 px grid, 1.8 px stroke, round caps (`apps/web/src/components/Icon.tsx`, Figma Icons page). Use 20 px in text rows and 22 px in navigation. Icons sit beside a label; icon-only buttons need an `aria-label`.
- **Covers:** show the work itself (a chart, screens, a slide). The demo draws them in `components/Cover.tsx`.
  - Work without images gets a Generated cover: kind, file type and title on a tone picked from the work.
  - Tone never says anything about quality.
  - No navy covers on work.
- **Logo:** the Sunrise tile (24 px minimum) plus the lowercase "vinden" wordmark. Use the components Logo / Tile, Logo / Lockup and Logo / Lockup on dark, never a rebuild.

## Voice and tone

Plain, specific and encouraging. Never corporate, never hype.

- **Buttons** are sentence case, start with a verb and say what happens: "Vouch for this work", "Send for verification", "Start task".
- **Numbers, names and dates beat adjectives.** Use "3 days ago" for the last week, then "Jun 2026".
- **Errors** say what happened, then the fix, and never blame.
- **Empty states** point to the next step.
- **Success messages** say what changed.
- **Never write** "endorse", "PoW", "Rs" or "INR", and no exclamation marks in UI.

## Accessibility (WCAG 2.1 AA)

- Text meets 4.5:1. Icons, input borders and large text meet 3:1.
- Colour is never the only cue: scores have numbers, checks have icons and words.
- Every interactive element shows a 2 px `--blue` focus ring.
- Use semantic HTML (one h1 per page, headings in order, buttons for actions, links for navigation). Use `aria-current="page"` on active navigation and `aria-pressed` on toggles.
- Covers have alt text that describes the work. Respect `prefers-reduced-motion`.

Related skills: vinden-information-architecture, vinden-build-feature, and the vinden-atom-* and vinden-component-* skills.
