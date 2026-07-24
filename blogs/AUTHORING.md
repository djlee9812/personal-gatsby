# Blog authoring guide

Posts are MDX files in `blogs/`. This is a quick review of the formatting that produces the intended layout.

## Frontmatter

```yaml
---
title: "Post Title"
date: "2026-05-09"
slug: "post-slug"          # URL: /blog/post-slug
tags: ["travel", "food"]
layout: essay               # "essay" or omit for a text-first "notes" post
---
```

- `layout: essay` — wider chrome, left-railed prose (images extend right from a shared left edge). Use for image-heavy storytelling (`Asymmetric`, `ImageGrid`).
- omit `layout` — standard centered narrow prose column. Just write Markdown.

## Body

Write normal Markdown (paragraphs, `##`/`###` headings, lists, links, `code`, `> quotes`). Prose stays at a readable width; the components below break out wider.

### Images — prefer `<Image>`

Markdown `![alt](src)` works (including inside `<Asymmetric>`), but `<Image>` is clearer and supports caption / size / align / loading:

```mdx
<Image
  src="https://res.cloudinary.com/.../photo.heic"
  alt="Describe the photo for screen readers / SEO"
  caption="Optional caption"
  size="content"   // content (default) | wide | full | fill
  align="left"     // optional: left-align a document/portrait (~18rem cap)
  width={4032}     // optional: intrinsic px — with height, reserves correct aspect (CLS)
  height={3024}
  loading="eager"  // optional: first above-fold image only; default is lazy
/>
```

- `content` fills the prose column, `wide` breaks out, `full` is edge-to-edge, `fill` is for use inside `Asymmetric`/`ImageGrid` (parent controls layout — you rarely set this yourself).
- Pass `width` + `height` (source pixel size) when you can — each photo keeps its own ratio; the browser holds the right box before the image loads. These do not change Cloudinary delivery size.

### Text + photo section: `<Asymmetric>`

One block of copy + one `<Image>`. Layout is automatic:

```mdx
## Section heading

<Asymmetric>

A paragraph (or few) of copy.

<Image src="..." alt="..." caption="..." />

</Asymmetric>
```

- **Short copy (< ~330 chars)** → image stacks under the text on the prose left rail (modest size). `reverse` is ignored when stacked.
- **Longer copy** → two columns (text | image), top-aligned.
- `reverse` swaps columns in columns mode only: `<Asymmetric reverse>`.
- Force a mode with `layout="stack"` or `layout="columns"`.
- Don't wrap text-only content in `<Asymmetric>` — just write Markdown paragraphs.

### Photo mosaic: `<ImageGrid>`

2–3 images side by side:

```mdx
<ImageGrid
  mobile="mosaic"  // optional: 2-up cover on small screens
  images={[
    { src: "...", alt: "...", caption: "..." },
    { src: "...", alt: "...", caption: "..." },
  ]}
/>
```

- Default: full-width stack on mobile; equal-height **contain** row on tablet+ (no crop — good for captioned pairs).
- `mobile="mosaic"`: 2-up **cover** grid on small screens (food dumps); leftover 3rd stays one-cell wide and centered. Desktop mosaic also uses cover at the shared row height.
- Per-image crop tweaks: `objectPosition`, `objectFit`, `coverHeightMobile` (needs `mobile="mosaic"`; below 640px only). Prefer `coverHeightMobile` over `coverHeight` — the latter is inline and overrides every breakpoint. Do not set both.

### Heading alignment (essay)

A section heading only widens to match a full-width block **when it is placed immediately before that block** (optionally with a `<TitleBand>` in between). Essays left-rail prose and breakouts to the same left edge, so keep this order:

```mdx
## Heading
<TitleBand>City - <time dateTime="2025-03-29">3/29/25</time></TitleBand>
<Asymmetric> ... </Asymmetric>
```

If you put a paragraph between the heading and the block, the heading stays at prose width (which is correct when the next content is narrow).

### Flags / emoji in headings

```mdx
## Tanzania <span className="heading-flag" role="img" aria-label="Tanzania">🇹🇿</span>
```

Always add `role="img"` + `aria-label` so the country reads correctly to screen readers.
