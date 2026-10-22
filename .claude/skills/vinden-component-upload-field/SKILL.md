---
name: vinden-component-upload-field
description: The Vinden Upload field component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a upload field in Figma or code, for example: Post work, private offer letters, brief submissions.
---

# Upload field (component)

Where people add the files that prove the work, with the list of files below.

**Use it for:** Post work, private offer letters, brief submissions.

**Not for:** Profile photos (needs a cropper, not designed yet).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Upload field**: page Forms, node `44:233`.
  - Variants: State=Default|Drag over.
  - Properties: Title (text), Hint (text).
  - Colour tokens: bg/surface, bg/trust, border/focus, border/strong, text/primary, text/tertiary.
  - Text styles: Label/Default, Caption.
- **File row**: page Forms, node `44:234`.
  - Properties: File name (text), Meta (text).
  - Colour tokens: bg/surface, border/default, text/primary, text/tertiary.
  - Text styles: Label/Small, Caption.

## Rules

- Dashed border; **Drag over** turns trust-blue. The hint names the types and the size limit.
- Each file becomes a File row: type icon, name, type and size, and remove.
- At least one file is required on Post work.

## In code

Paths are under `apps/web/src`.

- `<UploadField label files onAdd onRemove error? />` from components/Forms.tsx. The demo keeps only the name and size; real uploads need storage plus the AI check.

## Accessibility

- A real `<input type="file" multiple>` inside the label, so keyboard and screen readers work. Remove buttons say "Remove <file name>".

Related skills: vinden-component-teammate-row, vinden-product, vinden-visual-guidelines.
