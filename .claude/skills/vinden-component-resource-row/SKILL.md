---
name: vinden-component-resource-row
description: The Vinden Resource row component: one resource on a club's curated learning path (course, article, book, video, case study, industry report, tool, template). Figma properties, tokens, the React ResourceRow and accessibility. Use when a Vinden screen lists learning resources.
---

# Resource row (component)

One resource on a curated learning path (PDF §3E). Paths are short and curated, never a dump of links.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Club & training.
- **Resource row**: node `112:199`.
  - Properties: Title, Meta (type · site), Show remove (boolean).
  - The Lavender Icon tile is an exposed instance: swap its icon for the type.
  - Text styles: Title/Small and Caption.
  - Rows stack inside a bordered bg/surface card, with border/subtle dividers.

## Rules

- Each type has its own icon:

  | Type | Icon |
  |---|---|
  | Course | graduation |
  | Article | file |
  | Book | bookmark |
  | Video | sparkle |
  | Case study | briefcase |
  | Industry report | trendingUp |
  | Tool | sliders |
  | Template | plusSquare |

- A title that links out is underlined and opens in a new tab.
- Only the Core Team sees Remove.

## In code

- `<ResourceRow type title link? onRemove? removing? />` from `apps/web/src/components/ResourceRow.tsx`. Render it inside a `<ul class="tr-resources">`.

## Accessibility

- External links announce "(opens in a new tab)".
- Remove is labelled "Remove <title> from this path".

Related skills: vinden-atom-icon-tile, vinden-product.
