# Jaynish Shah personal website

## Getting started

```bash
npm install
npm run dev
```

The site is built with `Next.js` and uses file-based content under `src/content`.

## Content model

- Blog posts live in `src/content/blog`
- Case studies live in `src/content/case-studies`
- Images live in `public/images/...`
- Videos live in `public/videos/...`

Each entry uses frontmatter with:

- `title`
- `slug`
- `date`
- `summary`

Optional fields include `featuredImage`, `tags`, `draft`, and `canonicalUrl`.

Case studies can also include `company`, `role`, `year`, and `status`.

## Legacy WordPress mirror

The `src/wp-*` files and `scripts/mirror.py` are retained only as migration reference material while the Next site reaches full parity.

## Deployment

Primary target is Hostinger managed Node.js hosting. If runtime constraints appear, the site can be adapted for a static deployment path.

## Refreshing the legacy mirror

If you still need to re-fetch the old WordPress content during migration:

```bash
python3 scripts/mirror.py
```

This pulls pages from the sitemap and rewrites internal links to use local paths.
