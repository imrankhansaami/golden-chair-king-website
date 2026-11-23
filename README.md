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
shop.html               All chairs + live filters (category, price, sort, search)
product/<slug>.html     11 product detail pages (gallery, specs, related chairs)
cart.html               Cart page with quantity editor
checkout.html           Checkout — Cash on Delivery / bKash / Nagad advance (TrxID), order opens in WhatsApp
offers.html             Dedicated offers page with live countdown
about.html / contact.html / faq.html
delivery.html           Delivery & shipping info (rates are indicative — confirm with client)
order-tracking.html     Tracking page (live status via WhatsApp)
privacy-policy.html / terms.html / refund-exchange.html   (templates — review before launch)
404.html
src/input.css           Theme + custom styles  ->  build to assets/css/site.css
assets/js/site.js       Cart, EN/BN toggle, drawers, counts, filters, checkout, gallery
assets/js/products.js   Generated catalog copy for the browser
scripts/data/products.mjs   Catalog data — THE single source of truth (products, prices, specs, FAQs use it)
scripts/build-pages.mjs     Static page generator (writes ALL pages + sitemap.xml)
assets/img/             Logo, hero, product photos (webp), scenes, banners
```

## Commands

```bash
npm install              # once
npm run build            # regenerate all pages + sitemap + CSS
npm run build:css        # CSS only
npm run watch:css        # CSS watch while editing
npm run serve            # preview at http://localhost:5173
```

## Editing content

- **Products / prices / specs**: edit `scripts/data/products.mjs`, then `npm run build`.
  Every page (shop, products, offers, homepage, sitemap) regenerates from this file.
  Never edit the generated HTML by hand — it gets overwritten.
- **Real photos**: client photos are processed into `assets/img/products/<slug>-<n>.webp`.
  Add more gallery photos by dropping files with the same pattern and listing them in `photos`.
  The one-off importer is `scripts/prepare-client-photos.mjs` (expects raw files in Downloads).
- **Phone / WhatsApp / address / email**: the `SITE` object in `scripts/data/products.mjs`
  plus `WA_NUMBER` in `assets/js/site.js`.
- **Texts**: English is the default HTML content; Bengali lives in `data-bn` attributes.
- **Cache**: stylesheet/script URLs carry a build stamp (`?v=…`) so edits appear without hard refresh.


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

- [ ] Confirm real prices, delivery rates & policy texts with the client
      (demo prices ৳4,900 – ৳16,500; delivery rates are marked "indicative")
- [ ] Review the policy pages (privacy / terms / refund) before launch
- [ ] Card payments (SSLCommerz) — plug into `checkout.html` when the merchant account is ready
- [ ] Point domain + submit sitemap to Google Search Console
