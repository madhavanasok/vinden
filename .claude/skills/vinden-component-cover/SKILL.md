---
name: vinden-component-cover
description: The Vinden Cover component and its Generated cover: the eight cover tones, usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a cover in Figma or code, for example: Work cards, brief cards, the work page gallery, or work posted without images.
---

# Cover (component)

The preview of a piece of work at the top of its card or page.

**Use it for:** Work cards, brief cards, the work page gallery, the Post work preview.

**Not for:** Decoration or stock imagery.

## Tones

Eight light tones, so a row of cards never repeats one colour (client feedback, 30 Oct 2026: "they can't only repeat these four colours"). Each tone has four values:
- **bg:** the cover.
- **mark:** the main chart mark and icon.
- **soft:** secondary marks and decorative shapes.
- **ink:** text, at 4.5:1 or more on bg.

| Tone | bg | mark | soft | ink |
|---|---|---|---|---|
| Blue | #DCE8FB | #1565D8 | #ADC9F4 | #0F4FAE |
| Teal | #D3EFEB | #13877B | #9FD8D0 | #0B5E56 |
| Mint | #DDF2E4 | #23884F | #A8DDBC | #1D7A4F |
| Gold | #FFF3CC | #A67F00 | #FFD23F | #7A5B00 |
| Peach | #FDE3C8 | #CF6209 | #FBC793 | #A84B06 |
| Rose | #FBE1E7 | #D9466E | #F4AFC0 | #9C2747 |
| Lavender | #EFEAFD | #7B63D0 | #CFC2F7 | #5B43AE |
| Stone | #ECE7DC | #3D4A63 | #DDD8CC | #07142F |
| Navy | #0E1F45 | #F9963A | #FFD23F | #FFFFFF |

Navy is for editorial banners only. Never use it for a work cover: the client found dark navy covers heavy.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Cards, Section / Cover.
- **Cover** (node `27:41`): Tone=Blue|Teal|Mint|Gold|Peach|Rose|Lavender|Stone|Navy. It is a bar-chart placeholder for a drawn or uploaded preview.
- **Generated cover** (node `87:260`): Tone=Blue…Stone (no Navy).
  - Properties: Title (text), Kind (text, e.g. "Report · PDF") and Icon (instance swap). After swapping the icon, set its stroke to the tone's `cover/<tone>/mark`.
- **Colours** come from the **Cover** variable collection: `cover/<tone>/bg|mark|soft|ink`, aliased to Primitives.
  - The collection has one mode, so covers keep their colours in the dark theme without being pinned.
  - The new primitives are teal/*, green/100, green/200, green/600, rose/*, gold/650, orange/650 and lavender/650.
- **Default tones:** the Work card's default cover is Blue and the Brief card's is Gold. Override the tone per instance so neighbours differ.

## Rules

- The cover shows the work itself: a chart, screens, a slide. In the product it is generated from the upload.
- **No preview image, so use a Generated cover.** It shows the kind icon in a white tile, the kind and file type as an overline, and the title in Heading/H4 (max 3 lines), with a soft circle at the top right.
  - The tone comes from a stable hash of the work's slug: the same work always has the same colour, and neighbours usually differ.
  - Post work picks the tone once per draft.
- **Shorter covers:** below 170 px tall the title clamps to 2 lines. Below 140 px the tile is hidden, the title is 16/21 and the circle is 80 px.
- **Large (work page hero):** 20 px padding, a 28/34 title and a 280 px circle. On phones it starts 76 px down to clear Back and Share.
- **Always Light:** a cover is a picture of the work, so its colours never change with the theme. `--cover-*` tokens are not redefined in the dark block.
- **Tone says nothing about quality.** For drawn demo covers it loosely follows the subject.
- **Spread tones across a row.** Never put two of the same tone next to each other in a grid or rail.

## In code

Paths are under `apps/web/src`.

- `<Cover variant="cac" />` from components/Cover.tsx draws a demo cover. Each drawing declares its `tone` and uses `var(--cover-<tone>-*)`.
- `<Cover title kind meta seed />` without a known `variant` renders the Generated cover.
  - Set `tone` to fix the colour, otherwise `toneFor(seed)` picks it.
  - Add `large` for the work page hero.
  - `COVER_TONES`, `toneFor` and `formatFor` are exported.
- Tokens are `--cover-<tone>-bg|mark|soft|ink` in `:root` in styles.css.
- The API stores `works.cover_tone` and `works.format`. `POST /api/works` rejects navy.
- Demo assignment:

  | Tone | Covers |
  |---|---|
  | blue | cac, cac-report |
  | gold | kyc-funnel, cafe-prices |
  | lavender | checkin-phone, hostel-donut, deck |
  | teal | tam-circles, activation-line, dataset |
  | peach | retention-curve, laundry-deck |
  | rose | library-phones |
  | mint | canteen-bars |
  | stone | banking-table |

  The seeded works `cafe-pricing` and `laundry-deck` use generated covers.

## Accessibility

- Covers are `aria-hidden`: the card's title carries the meaning, which is why the generated cover can repeat it.
- Real uploaded previews need alt text that describes the work ("Funnel chart from the Snackly CAC teardown").

Related skills: vinden-component-work-card, vinden-component-brief-card, vinden-component-community-card, vinden-visual-guidelines.
