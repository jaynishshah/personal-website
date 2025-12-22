# Jaynish Shah site clone (Eleventy)

This repo contains a static mirror of `jaynishshah.com` prepared for Eleventy hosting.

## Getting started

```bash
npm install
npm run dev
```

Build output goes to `dist/`.

## Updating the mirror

Run the mirror script to re-fetch content and assets:

```bash
python3 scripts/mirror.py
```

This pulls pages from the sitemap and rewrites internal links to use local paths.
