# Golden Chair King — Furniture Ecommerce Website

Static ecommerce site for **Golden Chair King** (South Jatrabari, Dhaka) — built with
**Tailwind CSS v4 + daisyUI v5**, mobile-first, SEO optimized, bilingual (English / বাংলা).

- Live structure: plain HTML files — host on any static hosting (Vercel, Netlify, Cloudflare Pages, cPanel).
- No backend required: the cart runs in the browser (localStorage) and orders go through
  WhatsApp / email. Real payment (SSLCommerz / bKash API) can be plugged into `checkout.html` later.

## Brand

| Token | Value | Use |
|---|---|---|
| Navy | `#03182D` | header, footer, hero, primary buttons text |
| Gold | `#E9C786` | accents, CTAs (`btn-secondary`), highlights |
| Cream | `#FBF9F4` | page background (`base-100`) |

Colors are sampled from the client logo and defined in `src/input.css`
(daisyUI theme `gck` + `@theme` tokens).

## Project structure

```
index.html              Homepage
shop.html               All chairs + filters (category, price, sort, search)
product/<slug>.html     Product detail pages (generated)
about.html / contact.html / faq.html
cart.html / checkout.html / order-tracking.html
privacy-policy.html / terms.html / refund-exchange.html
src/input.css           Theme + custom styles  ->  build to assets/css/site.css
assets/js/site.js       Cart, EN/BN toggle, drawers, countdown, toasts
assets/js/products.js   Generated catalog copy for the browser
scripts/data/products.mjs   Catalog data — THE single source of truth
scripts/build-pages.mjs     Static page generator (reads the data, writes html)
assets/img/             Logo, hero, product photos (webp), scenes, banners
```

## Commands

```bash
npm install              # once
npm run build            # regenerate pages + CSS
npm run build:css        # CSS only
npm run watch:css        # CSS watch while editing
npm run serve            # preview at http://localhost:5173
```

## Editing content

- **Products / prices / names**: edit `scripts/data/products.mjs`, then run `npm run build`.
  This regenerates `index.html` (and later all pages) — do not edit the HTML by hand.
- **Real photos**: the client photos are already processed into
  `assets/img/products/<slug>-<n>.webp` (galleries) — just add more files with the
  same pattern and list them in the product's `photos` array. The one-off import
  tool is `scripts/prepare-client-photos.mjs` (expects the raw files in Downloads).
- **Phone / WhatsApp**: `SITE` object at the top of `scripts/data/products.mjs`
  plus `WA_NUMBER` in `assets/js/site.js`.
- **Texts**: English is the default HTML content; Bengali lives in `data-bn` attributes
  (the visible text is the English source for SEO).


## SEO

- Unique title/description/canonical per page, Open Graph + Twitter cards, `og-image.jpg`
- JSON-LD structured data: Store, WebSite + SearchAction, ItemList (home),
  Product + Offer + BreadcrumbList (product pages), FAQPage (faq)
- `sitemap.xml` + `robots.txt`, semantic landmarks, descriptive alt texts,
  lazy-loaded images with width/height (no layout shift)
- Update the domain in canonical/OG/sitemap when moving to a custom domain.

## Deploy

1. Run `npm run build`.
2. Upload the folder (excluding `node_modules`, `src`, `scripts`, `assets/img/src`) to any host.
3. Point `goldenchairking.com` at it. All URLs are relative — works from any folder.

## Pending / next steps

- [ ] Client review of updated homepage → build remaining pages (shop, product detail ×11,
      about, contact, cart, checkout, FAQ, policies) — `scripts/build-pages.mjs`
- [ ] Confirm real prices (demo prices are placeholders: ৳4,900 – ৳16,500)
- [ ] Wire real online payments (SSLCommerz / bKash merchant API) in checkout
- [ ] Point domain + submit sitemap to Google Search Console
