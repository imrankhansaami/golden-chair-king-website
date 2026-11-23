// ============================================================
// Golden Chair King — static page generator
// Run:  npm run build      (or: node scripts/build-pages.mjs)
// Reads data from scripts/data/products.mjs and writes index.html
// (later: shop.html, product/*.html, about.html, etc.)
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SITE, categories, products, latest, deals } from "./data/products.mjs";

// cache-buster: changes on every build so browsers never serve stale css/js
const ASSET_V = Date.now().toString(36);

const bnDigits = "\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF";
const bnNum = (n) => String(n).replace(/\d/g, (d) => bnDigits[+d]);

const money = (n) => "\u09F3" + n.toLocaleString("en-IN");
const discount = (p) => Math.round((1 - p.price / p.oldPrice) * 100);

/* ---------------- shared partials ---------------- */

const sprite = `
  <svg xmlns="http://www.w3.org/2000/svg" class="hidden" aria-hidden="true"><defs>
    <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></symbol>
    <symbol id="i-spark" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c.7 5.3 4.7 9.3 10 10-5.3.7-9.3 4.7-10 10-.7-5.3-4.7-9.3-10-10 5.3-.7 9.3-4.7 10-10Z"/></symbol>
    <symbol id="i-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></symbol>
    <symbol id="i-wa" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></symbol>
    <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></symbol>
    <symbol id="i-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
    <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol>
    <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></symbol>
    <symbol id="i-rotate" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></symbol>
    <symbol id="i-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
    <symbol id="i-msg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></symbol>
    <symbol id="i-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
    <symbol id="i-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></symbol>
    <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
    <symbol id="i-bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
    <symbol id="i-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></symbol>
    <symbol id="i-cat-exec" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12V4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V12"/><path d="M5 12h14a2 2 0 0 1 2 2v.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5V14a2 2 0 0 1 2-2Z"/><path d="M12 16v3"/><path d="m7 22 5-3 5 3"/></symbol>
    <symbol id="i-cat-wood" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12V4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V12"/><path d="M8.5 5.5h7"/><path d="M8.5 8h7"/><path d="M8.5 10.5h7"/><path d="M5 12h14a2 2 0 0 1 2 2v.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5V14a2 2 0 0 1 2-2Z"/><path d="M12 16v3"/><path d="m7 22 5-3 5 3"/></symbol>
    <symbol id="i-cat-highback" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5h6a1.5 1.5 0 0 1 1.5 1.5v2.5h-9V3A1.5 1.5 0 0 1 9 1.5Z"/><rect x="8" y="7" width="8" height="7.5" rx="1.8"/><path d="M6.5 14.5h11v2.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5Z"/><path d="M12 18.5V21"/><path d="m7.5 22.5 4.5-3 4.5 3"/></symbol>
    <symbol id="i-cat-office" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2.5" width="8" height="8.5" rx="3"/><path d="M6 13h12v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/><path d="M12 17v3"/><path d="m7 22 5-3 5 3"/></symbol>
  </defs></svg>`;

const header = (active = "home") => `
  <header id="site-header" class="sticky top-0 z-50 border-b border-base-200 bg-white">
    <div class="header-row container-x flex h-16 items-center gap-2 sm:gap-3 lg:h-[76px]">
      <button type="button" data-open-menu class="btn btn-circle btn-ghost text-navy-900 lg:hidden" aria-label="Open menu">
        <svg class="size-6"><use href="#i-menu"/></svg>
      </button>

      <a href="index.html" class="flex shrink-0 items-center" aria-label="${SITE.name} — Home">
        <img src="assets/img/logo-horizontal.png" alt="${SITE.name}" width="742" height="260" fetchpriority="high" class="h-9 w-auto rounded-xl ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.03] sm:h-10 lg:h-11">
      </a>

      <nav class="ml-5 hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
        <a href="index.html" class="nav-link${active === "home" ? " active" : ""}"${active === "home" ? ' aria-current="page"' : ""} data-bn="হোম">Home</a>
        <a href="shop.html" class="nav-link${active === "shop" ? " active" : ""}" data-bn="সব চেয়ার">Shop All</a>
        <div class="dropdown dropdown-hover">
          <button tabindex="0" type="button" class="nav-link flex items-center gap-1" aria-haspopup="true">
            <span data-bn="ক্যাটাগরি">Categories</span>
            <svg class="size-3.5"><use href="#i-chevron"/></svg>
          </button>
          <ul tabindex="0" class="dropdown-content menu z-[60] mt-1 w-72 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl">
${categories.map((c) => `            <li><a href="shop.html?cat=${c.slug}" class="font-semibold text-navy-900"><svg class="size-4.5 text-gold-600"><use href="#${c.icon}"/></svg><span data-bn="${c.bn}">${c.en}</span></a></li>`).join("\n")}
            <li class="mt-1 border-t border-base-200 pt-1"><a href="shop.html" class="font-extrabold text-primary"><span data-bn="সব চেয়ার দেখুন">View All Chairs</span><svg class="size-4"><use href="#i-arrow"/></svg></a></li>
          </ul>
        </div>
        <a href="offers.html" class="nav-link${active === "offers" ? " active" : ""}"${active === "offers" ? ' aria-current="page"' : ""} data-bn="অফার">Offers</a>
        <a href="about.html" class="nav-link${active === "about" ? " active" : ""}" data-bn="আমাদের সম্পর্কে">About</a>
        <a href="contact.html" class="nav-link${active === "contact" ? " active" : ""}" data-bn="যোগাযোগ">Contact</a>
      </nav>

      <div class="ml-auto flex items-center gap-1 sm:gap-2">
        <form action="shop.html" method="get" role="search" class="relative hidden lg:block lg:w-44 xl:w-60">
          <input type="search" name="q" placeholder="Search chairs…" data-bn-ph="চেয়ার খুঁজুন…" aria-label="Search chairs" class="input input-sm w-full border-base-300 bg-base-100 pl-8.5 text-sm text-navy-900 placeholder:text-base-content/40 focus:border-gold-400 focus:outline-none">
          <svg class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-base-content/40"><use href="#i-search"/></svg>
        </form>
        <button type="button" data-open-cart class="btn btn-circle btn-ghost relative text-navy-900" aria-label="Open cart">
          <svg class="size-5.5"><use href="#i-cart"/></svg>
          <span class="cart-count badge badge-secondary badge-sm absolute -top-0.5 -right-0.5 border-0 font-extrabold" style="display:none">0</span>
        </button>
      </div>
    </div>
  </header>`;

const mobileMenu = () => `
  <aside id="mobile-menu" class="site-drawer fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-sm -translate-x-full flex-col bg-navy-950 text-white shadow-2xl transition-transform duration-300" aria-hidden="true" aria-label="Mobile menu">
    <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <img src="assets/img/logo-horizontal.png" alt="${SITE.name}" width="742" height="260" class="h-9 w-auto">
      <button type="button" data-close class="btn btn-circle btn-ghost btn-sm text-white/70 hover:text-white" aria-label="Close menu">
        <svg class="size-5"><use href="#i-x"/></svg>
      </button>
    </div>
    <div class="px-4 pt-4">
      <form action="shop.html" method="get" role="search" class="relative">
        <input type="search" name="q" placeholder="Search chairs…" data-bn-ph="চেয়ার খুঁজুন…" aria-label="Search chairs" class="input w-full border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/40">
        <svg class="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-white/40"><use href="#i-search"/></svg>
      </form>
    </div>
    <nav class="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile navigation">
      <a href="index.html" class="menu-link active"><span data-bn="হোম">Home</span><svg class="size-4 text-gold-400"><use href="#i-arrow"/></svg></a>
      <a href="shop.html" class="menu-link"><span data-bn="সব চেয়ার">Shop All</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <details class="group">
        <summary class="menu-link cursor-pointer list-none select-none">
          <span data-bn="ক্যাটাগরি">Categories</span>
          <svg class="size-4 text-white/40 transition-transform group-open:rotate-180"><use href="#i-chevron"/></svg>
        </summary>
        <div class="mb-1 ml-3 space-y-0.5 border-l border-white/10 pl-3">
${categories.map((c) => `          <a href="shop.html?cat=${c.slug}" class="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-gold-400" data-bn="${c.bn}">${c.en}</a>`).join("\n")}
        </div>
      </details>
      <a href="offers.html" class="menu-link"><span data-bn="অফার">Offers</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <a href="about.html" class="menu-link"><span data-bn="আমাদের সম্পর্কে">About</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <a href="contact.html" class="menu-link"><span data-bn="যোগাযোগ">Contact</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <a href="faq.html" class="menu-link"><span data-bn="সাধারণ প্রশ্ন (FAQ)">FAQ</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <a href="order-tracking.html" class="menu-link"><span data-bn="অর্ডার ট্র্যাক করুন">Track Order</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
      <a href="delivery.html" class="menu-link"><span data-bn="ডেলিভারি তথ্য">Delivery Info</span><svg class="size-4 text-white/25"><use href="#i-arrow"/></svg></a>
    </nav>
    <div class="space-y-3 border-t border-white/10 p-4">
      <button type="button" class="lang-toggle btn w-full border-white/20 bg-white/5 font-bold text-gold-300 hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950">
        <span class="lang-toggle-label">বাংলা</span>
      </button>
      <div class="grid grid-cols-2 gap-3">
        <a href="tel:${SITE.phone}" class="btn btn-secondary font-bold"><svg class="size-4"><use href="#i-phone"/></svg><span data-bn="কল করুন">Call Now</span></a>
        <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="btn border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপ">WhatsApp</span></a>
      </div>
    </div>
  </aside>`;

const cartDrawer = () => `
  <aside id="cart-drawer" class="site-drawer fixed inset-y-0 right-0 z-[70] flex w-[92vw] max-w-md translate-x-full flex-col bg-base-100 shadow-2xl transition-transform duration-300" aria-hidden="true" aria-label="Shopping cart">
    <div class="flex items-center justify-between bg-navy-950 px-5 py-4">
      <h2 class="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
        <svg class="size-5 text-gold-400"><use href="#i-cart"/></svg>
        <span data-bn="আপনার কার্ট">Your Cart</span>
      </h2>
      <button type="button" data-close class="btn btn-circle btn-ghost btn-sm text-white/70 hover:text-white" aria-label="Close cart">
        <svg class="size-5"><use href="#i-x"/></svg>
      </button>
    </div>
    <div id="cart-items" class="flex-1 space-y-3 overflow-y-auto p-4"></div>
    <div class="space-y-3 border-t border-base-300 bg-base-200/60 p-5">
      <div class="flex items-center justify-between text-sm font-bold text-navy-900">
        <span data-bn="সাবটোটাল">Subtotal</span>
        <span id="cart-subtotal" class="text-base font-extrabold text-primary">৳0</span>
      </div>
      <p class="text-[11px] leading-relaxed text-base-content/55" data-bn="ডেলিভারি চার্জ চেকআউটে যোগ করা হবে। সারা বাংলাদেশে ডেলিভারি।">Delivery charge is added at checkout. We deliver all over Bangladesh.</p>
      <div class="grid grid-cols-2 gap-3">
        <a href="cart.html" class="btn btn-outline font-bold" data-bn="কার্ট দেখুন">View Cart</a>
        <a href="checkout.html" class="btn btn-secondary font-bold" data-bn="চেকআউট করুন">Checkout</a>
      </div>
    </div>
  </aside>`;

const overlays = () => `
  <div id="overlay" class="fixed inset-0 z-[60] hidden bg-navy-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300" aria-hidden="true"></div>
  <div id="toasts" class="pointer-events-none fixed inset-x-0 bottom-[72px] z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-8" aria-live="polite"></div>
  <button id="to-top-mobile" type="button" class="pointer-events-none fixed right-4 bottom-[84px] z-40 flex size-10 items-center justify-center rounded-full border border-white/10 bg-navy-900 text-gold-300 opacity-0 shadow-lg transition-opacity lg:hidden" aria-label="Back to top">
    <svg class="size-4.5"><use href="#i-up"/></svg>
  </button>`;

const footer = () => `
  <footer class="border-t border-gold-400/20 bg-navy-950 pt-14 text-white/80">
    <div class="container-x grid grid-cols-2 gap-8 pb-12 sm:gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
      <div class="col-span-2 lg:col-span-1">
        <img src="assets/img/logo-horizontal.png" alt="${SITE.name}" width="742" height="260" loading="lazy" class="h-11 w-auto">
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/60" data-bn="গোল্ডেন চেয়ার কিং ঢাকার বিশ্বস্ত চেয়ার শোরুম — এক্সিকিউটিভ ও বজ চেয়ার, উডেন বজ চেয়ার, এরগনমিক মেশ ও স্টাফ চেয়ার সাশ্রয়ী দামে, সারা দেশে ডেলিভারিসহ।">${SITE.name} is a trusted chair shop in Dhaka — executive &amp; boss chairs, wooden boss chairs, ergonomic mesh and staff chairs at honest prices, with nationwide delivery.</p>
        <div class="mt-5 flex gap-2.5">
          <a href="${SITE.facebook}" target="_blank" rel="noopener" class="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950" aria-label="${SITE.name} on Facebook"><svg class="size-4.5"><use href="#i-fb"/></svg></a>
          <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950" aria-label="WhatsApp"><svg class="size-4.5"><use href="#i-wa"/></svg></a>
          <a href="https://m.me/${SITE.messenger}" target="_blank" rel="noopener" class="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950" aria-label="Messenger"><svg class="size-4.5"><use href="#i-msg"/></svg></a>
        </div>
      </div>
      <div>
        <h3 class="text-[13px] font-extrabold tracking-[0.18em] text-gold-400 uppercase" data-bn="দ্রুত লিংক">Quick Links</h3>
        <ul class="mt-4 space-y-2.5">
          <li><a href="about.html" class="footer-link" data-bn="আমাদের সম্পর্কে">About Us</a></li>
          <li><a href="shop.html" class="footer-link" data-bn="সব চেয়ার">Shop All</a></li>
          <li><a href="offers.html" class="footer-link" data-bn="অফার">Offers</a></li>
          <li><a href="order-tracking.html" class="footer-link" data-bn="অর্ডার ট্র্যাকিং">Order Tracking</a></li>
          <li><a href="delivery.html" class="footer-link" data-bn="ডেলিভারি তথ্য">Delivery Info</a></li>
          <li><a href="faq.html" class="footer-link" data-bn="সাধারণ প্রশ্ন (FAQ)">FAQ</a></li>
          <li><a href="contact.html" class="footer-link" data-bn="যোগাযোগ করুন">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-[13px] font-extrabold tracking-[0.18em] text-gold-400 uppercase" data-bn="ক্যাটাগরি">Categories</h3>
        <ul class="mt-4 space-y-2.5">
${categories.map((c) => `          <li><a href="shop.html?cat=${c.slug}" class="footer-link" data-bn="${c.bn}">${c.en}</a></li>`).join("\n")}
        </ul>
      </div>
      <div class="col-span-2 lg:col-span-1">
        <h3 class="text-[13px] font-extrabold tracking-[0.18em] text-gold-400 uppercase" data-bn="যোগাযোগ">Contact</h3>
        <ul class="mt-4 space-y-3.5 text-sm">
          <li class="flex items-start gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-400"><use href="#i-pin"/></svg><span>${SITE.address}, Bangladesh</span></li>
          <li class="flex items-start gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-400"><use href="#i-phone"/></svg><a href="tel:${SITE.phone}" class="footer-link">${SITE.phoneDisplay}</a></li>
          <li class="flex items-start gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-400"><use href="#i-mail"/></svg><a href="mailto:${SITE.email}" class="footer-link">${SITE.email}</a></li>
          <li class="flex items-start gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-400"><use href="#i-clock"/></svg><span>${SITE.hours}</span></li>
        </ul>
        <h3 class="mt-6 text-[13px] font-extrabold tracking-[0.18em] text-gold-400 uppercase" data-bn="পেমেন্ট মাধ্যম">We Accept</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="pay-chip">bKash</span>
          <span class="pay-chip">Nagad</span>
          <span class="pay-chip" data-bn="ক্যাশ অন ডেলিভারি">Cash on Delivery</span>
          <span class="pay-chip">Upay</span>
          <span class="pay-chip">Visa</span>
          <span class="pay-chip">Mastercard</span>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-x flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/45 sm:flex-row sm:text-left">
        <p>© 2026 <span class="font-semibold text-white/70">${SITE.name}</span>. <span data-bn="সর্বস্বত্ব সংরক্ষিত।">All rights reserved.</span></p>
        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
          <nav class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Legal">
            <a href="privacy-policy.html" class="transition-colors hover:text-gold-400" data-bn="গোপনীয়তা নীতি">Privacy Policy</a>
            <a href="terms.html" class="transition-colors hover:text-gold-400" data-bn="শর্তাবলী">Terms of Service</a>
            <a href="refund-exchange.html" class="transition-colors hover:text-gold-400" data-bn="রিফান্ড ও এক্সচেঞ্জ">Refund &amp; Exchange</a>
          </nav>
          <button type="button" class="lang-toggle inline-flex items-center rounded-full border border-gold-400/30 px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide text-gold-300 transition-colors hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950" aria-label="Switch to Bangla">
            <span class="lang-toggle-label">বাংলা</span>
          </button>
        </div>
      </div>
    </div>
  </footer>`;

const floatingButtons = () => `
  <div class="fixed right-5 bottom-6 z-40 hidden flex-col items-center gap-3 lg:flex">
    <button id="to-top" type="button" class="btn btn-circle border-white/10 bg-navy-900 text-gold-300 opacity-0 transition-opacity hover:bg-navy-800" aria-label="Back to top">
      <svg class="size-5"><use href="#i-up"/></svg>
    </button>
    <a href="https://wa.me/${SITE.wa}?text=Assalamu%20Alaikum!%20I%20need%20help%20choosing%20a%20chair." target="_blank" rel="noopener" class="wa-pulse btn btn-circle btn-lg border-0 bg-[#25D366] text-white shadow-lg hover:bg-[#1fba57]" aria-label="Chat on WhatsApp">
      <svg class="size-6"><use href="#i-wa"/></svg>
    </a>
    <a href="https://m.me/${SITE.messenger}" target="_blank" rel="noopener" class="btn btn-circle btn-lg border-0 bg-[#0084FF] text-white shadow-lg hover:bg-[#0073e0]" aria-label="Message us on Messenger">
      <svg class="size-6"><use href="#i-msg"/></svg>
    </a>
    <a href="tel:${SITE.phone}" class="btn btn-circle btn-lg border border-white/10 bg-navy-900 text-gold-300 shadow-lg hover:bg-navy-800" aria-label="Call us">
      <svg class="size-5.5"><use href="#i-phone"/></svg>
    </a>
  </div>`;

const bottomNav = (active = "home") => `
  <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy-950 lg:hidden" aria-label="Quick navigation">
    <div class="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
      <a href="index.html" class="bottom-nav-item${active === "home" ? " active" : ""}"${active === "home" ? ' aria-current="page"' : ""}>
        <svg class="size-5"><use href="#i-home"/></svg>
        <span data-bn="হোম">Home</span>
      </a>
      <a href="shop.html" class="bottom-nav-item${active === "shop" ? " active" : ""}">
        <svg class="size-5"><use href="#i-bag"/></svg>
        <span data-bn="শপ">Shop</span>
      </a>
      <a href="tel:${SITE.phone}" class="bottom-nav-item">
        <svg class="size-5"><use href="#i-phone"/></svg>
        <span data-bn="কল">Call</span>
      </a>
      <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="bottom-nav-item">
        <svg class="size-5 text-[#25D366]"><use href="#i-wa"/></svg>
        <span data-bn="হোয়াটসঅ্যাপ">WhatsApp</span>
      </a>
      <button type="button" data-open-cart class="bottom-nav-item relative">
        <span class="relative">
          <svg class="size-5"><use href="#i-cart"/></svg>
          <span class="cart-count absolute -top-1.5 -right-2.5 size-4 items-center justify-center rounded-full bg-gold-400 text-[9px] font-extrabold text-navy-950" style="display:none">0</span>
        </span>
        <span data-bn="কার্ট">Cart</span>
      </button>
    </div>
  </nav>`;

/* ---------------- product card ---------------- */

const starsRow = (p) => `
              <div class="mt-1.5 flex items-center gap-1">
                <span class="flex gap-px text-gold-500" aria-hidden="true"><svg class="size-3"><use href="#i-star"/></svg><svg class="size-3"><use href="#i-star"/></svg><svg class="size-3"><use href="#i-star"/></svg><svg class="size-3"><use href="#i-star"/></svg><svg class="size-3${p.rating < 5 ? " opacity-30" : ""}"><use href="#i-star"/></svg></span>
                <span class="text-[11px] font-bold text-base-content/50">${p.rating.toFixed(1)} <span class="font-semibold text-base-content/35">(${p.reviews})</span></span>
              </div>`;

const productCard = (p, { deal = false } = {}) => {
  const wrap = deal
    ? "card-hair group relative flex w-[70vw] max-w-[270px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm transition-all duration-300 hover:border-gold-400/50 hover:shadow-xl"
    : "card-hair group relative flex flex-col overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/50 hover:shadow-xl";
  const dataAttrs = `data-slug="${p.slug}" data-cat="${p.cat}" data-price="${p.price}" data-old="${p.oldPrice}" data-rating="${p.rating}" data-deal="${deals.some((d) => d.slug === p.slug) ? 1 : 0}" data-search="${(p.name + " " + p.nameBn + " " + p.catEn).toLowerCase()}"`;
  return `          <article class="${wrap}" ${dataAttrs}${deal ? "" : " data-reveal"}>
            <figure class="shine relative aspect-square overflow-hidden bg-white">
              <a href="product/${p.slug}.html" aria-label="${p.name}">
                <img src="${p.photos[0]}" alt="${p.alt}" width="1000" height="1000" loading="lazy" decoding="async" class="img-fade h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
              </a>
              <span class="absolute top-2.5 left-2.5 rounded-full bg-navy-950 px-2.5 py-1 text-[10px] font-extrabold text-gold-300">−${discount(p)}%</span>
              <button type="button" data-wa data-name="${p.name}" data-price="${p.price}" aria-label="Order ${p.name} on WhatsApp" class="absolute right-2.5 bottom-2.5 flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110">
                <svg class="size-4.5"><use href="#i-wa"/></svg>
              </button>
            </figure>
            <div class="flex flex-1 flex-col p-3 sm:p-4">
              <p class="text-[10px] font-extrabold tracking-wider text-base-content/40 uppercase" data-bn="${p.catBn}">${p.catEn}</p>
              <h3 class="mt-1 line-clamp-2 font-display text-[12px] leading-snug font-semibold tracking-[0.02em] text-navy-900 sm:text-[13px]">
                <a href="product/${p.slug}.html" class="transition-colors hover:text-primary" data-bn="${p.nameBn}">${p.name}</a>
              </h3>
${starsRow(p)}
              <div class="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span class="font-display text-[15px] font-bold text-navy-900 sm:text-base">${money(p.price)}</span>
                <span class="text-xs font-semibold text-base-content/35 line-through">${money(p.oldPrice)}</span>
              </div>
              <div class="mt-auto pt-3">
                <button type="button" data-add data-id="${p.slug}" data-name="${p.name}" data-name-bn="${p.nameBn}" data-price="${p.price}" data-img="${p.photos[0]}" class="btn btn-sm w-full border border-gold-400/40 bg-navy-950 font-bold text-gold-300 transition-colors hover:border-gold-400 hover:bg-navy-800 hover:text-gold-200">
                  <svg class="size-4"><use href="#i-cart"/></svg><span class="text-[11px] font-extrabold tracking-wider" data-bn="কার্টে যোগ করুন">Add to Cart</span>
                </button>
              </div>
            </div>
          </article>`;
};

/* ---------------- marquee ---------------- */

const marqueeItems = [
  ["Executive & Boss Chairs", "এক্সিকিউটিভ ও বজ চেয়ার"],
  ["Ergonomic Mesh Chairs", "এরগনমিক মেশ চেয়ার"],
  ["Wooden Boss Chairs", "উডেন বজ চেয়ার"],
  ["Staff & Visitor Chairs", "স্টাফ ও ভিজিটর চেয়ার"],
  ["Nationwide Delivery", "সারা দেশে ডেলিভারি"],
  ["7-Day Easy Exchange", "৭ দিনের সহজ এক্সচেঞ্জ"],
  ["Cash on Delivery", "ক্যাশ অন ডেলিভারি"],
];
const marqueeSet = () =>
  marqueeItems
    .map(
      ([en, bn]) =>
        `        <span class="flex shrink-0 items-center gap-10"><span class="text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase sm:text-xs" data-bn="${bn}">${en.replace("&", "&amp;")}</span><svg class="size-3.5 shrink-0 text-gold-500/60" aria-hidden="true"><use href="#i-spark"/></svg></span>`
    )
    .join("\n");

/* ---------------- structured data ---------------- */

const homeJsonLd = () => {
  const itemList = products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      image: `${SITE.domain}/${p.photos[0]}`,
      url: `${SITE.domain}/product/${p.slug}.html`,
      brand: { "@type": "Brand", name: SITE.name },
      offers: { "@type": "Offer", price: String(p.price), priceCurrency: "BDT", availability: "https://schema.org/InStock" },
    },
  }));
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Store",
          "@id": `${SITE.domain}/#store`,
          name: SITE.name,
          url: `${SITE.domain}/`,
          image: `${SITE.domain}/assets/img/logo-lockup.png`,
          logo: `${SITE.domain}/assets/img/logo-lockup.png`,
          description: "Office chair shop in Dhaka, Bangladesh — executive & boss chairs, wooden boss chairs, ergonomic mesh chairs and staff chairs with nationwide delivery.",
          telephone: SITE.phone,
          email: SITE.email,
          priceRange: "৳৳",
          currenciesAccepted: "BDT",
          paymentAccepted: "Cash on Delivery, bKash, Nagad",
          address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Dhaka", addressCountry: "BD" },
          areaServed: { "@type": "Country", name: "Bangladesh" },
          sameAs: [SITE.facebook],
          openingHoursSpecification: [
            { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "10:00", closes: "21:00" },
          ],
        },
        {
          "@type": "WebSite",
          "@id": `${SITE.domain}/#website`,
          url: `${SITE.domain}/`,
          name: SITE.name,
          publisher: { "@id": `${SITE.domain}/#store` },
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${SITE.domain}/shop.html?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        },
        { "@type": "ItemList", name: "Office chairs — Golden Chair King", itemListElement: itemList },
      ],
    },
    null,
    2
  );
};

/* ---------------- homepage ---------------- */

const homePage = () => `<!doctype html>
<html lang="en" data-theme="gck" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Golden Chair King | Office Chairs in Dhaka — Boss, Mesh &amp; Staff Chairs</title>
  <meta name="description" content="Shop executive &amp; boss chairs, ergonomic high-back mesh chairs, staff &amp; visitor chairs at Golden Chair King, Jatrabari, Dhaka. Nationwide delivery, cash on delivery, bKash &amp; Nagad.">
  <link rel="canonical" href="${SITE.domain}/">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#03182D">
  <meta name="author" content="${SITE.name}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="Golden Chair King — Office Chairs in Dhaka, Bangladesh">
  <meta property="og:description" content="Executive &amp; boss chairs, ergonomic mesh chairs, staff chairs &amp; more. Nationwide delivery, cash on delivery, bKash &amp; Nagad payment.">
  <meta property="og:url" content="${SITE.domain}/">
  <meta property="og:image" content="${SITE.domain}/assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="bn_BD">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Golden Chair King — Office Chairs in Dhaka">
  <meta name="twitter:description" content="Executive &amp; boss chairs, ergonomic mesh chairs &amp; staff seating. Nationwide delivery across Bangladesh.">
  <meta name="twitter:image" content="${SITE.domain}/assets/img/og-image.jpg">

  <!-- Icons -->
  <link rel="icon" href="assets/img/favicon.png" sizes="any">
  <link rel="icon" href="assets/img/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&amp;family=Montserrat:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">

  <!-- Styles & assets -->
  <link rel="stylesheet" href="assets/css/site.css?v=${ASSET_V}">
  <link rel="preload" as="image" href="assets/img/slides/slide-comfort.webp">

  <!-- Structured data -->
  <script type="application/ld+json">
${homeJsonLd()}
  </script>
</head>

<body class="has-bottom-nav bg-base-100 font-sans text-base-content antialiased">

  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-bold focus:text-navy-950">Skip to content</a>

  <!-- ======= SVG icon sprite ======= -->
${sprite}

  <!-- ======= Promo bar ======= -->
  <div class="border-b border-gold-400/10 bg-navy-950 text-[11px] font-semibold text-white/80 sm:text-xs">
    <div class="container-x flex h-9 items-center justify-between gap-3 sm:h-10">
      <p class="flex min-w-0 items-center gap-2">
        <svg class="size-3.5 shrink-0 text-gold-400"><use href="#i-truck"/></svg>
        <span class="truncate" data-bn="সারা বাংলাদেশে ডেলিভারি — ক্যাশ অন ডেলিভারি সুবিধা">Nationwide delivery across Bangladesh — Cash on Delivery available</span>
      </p>
      <a href="tel:${SITE.phone}" class="flex shrink-0 items-center gap-1.5 text-gold-300 transition-colors hover:text-gold-400">
        <svg class="size-3.5"><use href="#i-phone"/></svg>
        <span data-bn="কাস্টমার কেয়ার:">Customer Care:</span> ${SITE.phoneDisplay}
      </a>
    </div>
  </div>

  <!-- ======= Header ======= -->
${header("home")}

  <!-- ======= Mobile menu drawer ======= -->
${mobileMenu()}

  <!-- ======= Cart drawer ======= -->
${cartDrawer()}

  <!-- ======= Overlay + toasts ======= -->
${overlays()}

  <main id="main">

    <!-- ======= Hero slider ======= -->
    <section id="hero-slider" class="relative overflow-hidden bg-[#02101f]" aria-roledescription="carousel" aria-label="Featured collections">

      <div id="hero-track" class="flex transition-transform duration-700 ease-out">
        <!-- Slide 1 — designed for comfort (banner) -->
        <div class="relative flex h-[186px] w-full shrink-0 items-center justify-center overflow-hidden sm:h-auto" role="group" aria-roledescription="slide" aria-label="1 of 4">
          <h1 class="sr-only">Premium Office Chairs — designed for comfort, built for work | Golden Chair King, Dhaka</h1>
          <img src="assets/img/slides/slide-comfort.webp" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" >
          <img src="assets/img/slides/slide-comfort.webp" alt="Designed for comfort, built for work — a Golden Chair King ergonomic mesh chair with free delivery" width="1600" height="678" fetchpriority="high" class="relative h-auto max-h-[720px] w-full object-contain">
          <a href="shop.html" class="group btn btn-gold absolute right-2 bottom-11 z-10 font-extrabold sm:right-8 sm:bottom-7">
            <span data-bn="সব চেয়ার দেখুন">Shop All Chairs</span>
            <svg class="size-4.5 transition-transform duration-300 group-hover:translate-x-1"><use href="#i-arrow"/></svg>
          </a>
        </div>

        <!-- Slide 2 — comfort that works with you (banner) -->
        <div class="relative flex h-[186px] w-full shrink-0 items-center justify-center overflow-hidden sm:h-auto" role="group" aria-roledescription="slide" aria-label="2 of 4">
          <img src="assets/img/slides/slide-collection.webp" alt="" aria-hidden="true" loading="lazy" class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl">
          <img src="assets/img/slides/slide-collection.webp" alt="Comfort that works with you — explore the Golden Chair King office chair collection, free delivery available" width="1600" height="684" loading="lazy" class="relative h-auto max-h-[720px] w-full object-contain">
          <a href="shop.html" class="group btn btn-gold absolute right-2 bottom-11 z-10 font-extrabold sm:right-8 sm:bottom-7">
            <span data-bn="কালেকশন দেখুন">Browse the Collection</span>
            <svg class="size-4.5 transition-transform duration-300 group-hover:translate-x-1"><use href="#i-arrow"/></svg>
          </a>
        </div>

        <!-- Slide 3 — showroom -->
        <div class="relative w-full shrink-0 overflow-hidden" role="group" aria-roledescription="slide" aria-label="3 of 4">
          <img src="assets/img/hero-showroom.webp" alt="Golden Chair King showroom in Dhaka — executive desk with a navy and gold interior" width="1600" height="1200" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-center">
          <div class="absolute inset-0 bg-gradient-to-r from-[#02101f] via-[#02101f]/85 to-[#02101f]/35" aria-hidden="true"></div>
          <div class="container-x relative flex h-[186px] flex-col justify-center py-3 sm:h-auto sm:min-h-[600px] sm:py-16 lg:py-20">
            <span class="max-sm:hidden inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-gold-300 sm:text-xs" data-bn="শোরুম কালেকশন">The Showroom Collection</span>
            <h2 class="mt-4 max-w-3xl font-display text-[18px] leading-[1.2] font-semibold text-white sm:text-5xl sm:leading-[1.15] lg:text-[52px]">
              <span data-bn="আপনার অফিস সাজান">Furnish Your Office</span>
              <span class="gold-text mt-1 block" data-bn="গোল্ডেন স্টাইলে">In Golden Style</span>
            </h2>
            <p class="max-sm:hidden mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base" data-bn="এক্সিকিউটিভ ও বজ চেয়ার, উডেন ক্লাসিক আর এরগনমিক মেশ — নিজের টিমে চেক, প্যাক ও ডেলিভারি।">Executive and boss chairs, wooden classics and ergonomic mesh — inspected, wrapped and delivered by our own team.</p>
            <div class="mt-3 flex flex-wrap gap-3 sm:mt-7">
              <a href="shop.html" class="group btn btn-gold btn-lg font-extrabold">
                <span data-bn="কালেকশন দেখুন">Browse the Collection</span>
                <svg class="size-5 transition-transform duration-300 group-hover:translate-x-1"><use href="#i-arrow"/></svg>
              </a>
              <a href="about.html" class="max-sm:hidden btn btn-lg border-gold-400/60 bg-transparent font-bold text-gold-300 hover:border-gold-400 hover:bg-gold-400 hover:text-navy-950">
                <span data-bn="আমাদের সম্পর্কে">Visit the Showroom</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Slide 4 — delivery -->
        <div class="relative w-full shrink-0 overflow-hidden" role="group" aria-roledescription="slide" aria-label="4 of 4">
          <img src="assets/img/scenes/home-office.webp" alt="A Golden Chair King mesh chair at a modern desk — nationwide delivery" width="1536" height="1024" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-center">
          <div class="absolute inset-0 bg-gradient-to-r from-[#02101f] via-[#02101f]/85 to-[#02101f]/35" aria-hidden="true"></div>
          <div class="container-x relative flex h-[186px] flex-col justify-center py-3 sm:h-auto sm:min-h-[600px] sm:py-16 lg:py-20">
            <span class="max-sm:hidden inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-gold-300 sm:text-xs" data-bn="সারা দেশে ডেলিভারি">Nationwide Delivery</span>
            <h2 class="mt-4 max-w-3xl font-display text-[18px] leading-[1.2] font-semibold text-white sm:text-5xl sm:leading-[1.15] lg:text-[52px]">
              <span data-bn="৬৪ জেলায় পৌঁছে যাবে">Delivered to All 64 Districts</span>
              <span class="gold-text mt-1 block" data-bn="পেমেন্ট চেয়ার হাতে পেয়ে">Pay When It Arrives</span>
            </h2>
            <p class="max-sm:hidden mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base" data-bn="ক্যাশ অন ডেলিভারি, বিকাশ বা নগদ — হোয়াটসঅ্যাপে অর্ডার কনফার্ম, তারপরই ডিসপ্যাচ।">Cash on delivery, bKash or Nagad — order on WhatsApp and we confirm everything before dispatch.</p>
            <div class="mt-3 flex flex-wrap gap-3 sm:mt-7">
              <a href="offers.html" class="group btn btn-gold btn-lg font-extrabold">
                <span data-bn="অফার দেখুন">View Offers</span>
                <svg class="size-5 transition-transform duration-300 group-hover:translate-x-1"><use href="#i-arrow"/></svg>
              </a>
              <a href="https://wa.me/${SITE.wa}?text=Assalamu%20Alaikum!%20I%20want%20to%20order%20a%20chair." target="_blank" rel="noopener" class="max-sm:hidden btn btn-lg border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]">
                <svg class="size-5"><use href="#i-wa"/></svg>
                <span data-bn="হোয়াটসঅ্যাপে অর্ডার">Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- slider controls -->
      <button type="button" data-hero-prev class="btn btn-circle absolute top-1/2 left-3 z-10 hidden -translate-y-1/2 border border-white/15 bg-[#02101f]/50 text-gold-300 backdrop-blur transition-colors hover:border-gold-400 hover:text-gold-200 sm:inline-flex lg:left-6" aria-label="Previous slide">
        <svg class="size-5 -rotate-180"><use href="#i-arrow"/></svg>
      </button>
      <button type="button" data-hero-next class="btn btn-circle absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 border border-white/15 bg-[#02101f]/50 text-gold-300 backdrop-blur transition-colors hover:border-gold-400 hover:text-gold-200 sm:inline-flex lg:right-6" aria-label="Next slide">
        <svg class="size-5"><use href="#i-arrow"/></svg>
      </button>
      <div class="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#02101f]/40 px-2.5 py-1.5 backdrop-blur sm:bottom-5 sm:gap-2 sm:px-3.5 sm:py-2">
        <button type="button" data-hero-dot class="hero-dot active" aria-label="Go to slide 1"></button>
        <button type="button" data-hero-dot class="hero-dot" aria-label="Go to slide 2"></button>
        <button type="button" data-hero-dot class="hero-dot" aria-label="Go to slide 3"></button>
        <button type="button" data-hero-dot class="hero-dot" aria-label="Go to slide 4"></button>
      </div>
    </section>

    <!-- ======= Marquee ======= -->
    <div class="marquee overflow-hidden border-t border-gold-400/15 bg-navy-950 py-3.5" aria-hidden="true">
      <div class="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
${marqueeSet()}
${marqueeSet()}
      </div>
    </div>

    <!-- ======= Stats ======= -->
    <section class="border-b border-gold-400/20 bg-navy-950">
      <div class="container-x grid grid-cols-2 gap-x-4 gap-y-8 py-8 sm:py-10 lg:grid-cols-4" data-stagger>
        <div class="text-center" data-reveal>
          <p class="font-display text-3xl font-bold text-gold-300 tabular-nums sm:text-4xl"><span data-count="12000">12,000</span><span class="text-gold-500">+</span></p>
          <p class="mt-1.5 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase" data-bn="সন্তুষ্ট ক্রেতা">Happy Customers</p>
        </div>
        <div class="text-center" data-reveal>
          <p class="font-display text-3xl font-bold text-gold-300 tabular-nums sm:text-4xl"><span data-count="4.9" data-decimals="1">4.9</span><span class="ml-1 text-gold-500">★</span></p>
          <p class="mt-1.5 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase" data-bn="গড় ক্রেতা রেটিং">Average Rating</p>
        </div>
        <div class="text-center" data-reveal>
          <p class="font-display text-3xl font-bold text-gold-300 tabular-nums sm:text-4xl"><span data-count="64">64</span></p>
          <p class="mt-1.5 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase" data-bn="জেলায় ডেলিভারি">Districts Delivered</p>
        </div>
        <div class="text-center" data-reveal>
          <p class="font-display text-3xl font-bold text-gold-300 tabular-nums sm:text-4xl"><span data-count="100">100</span><span class="text-gold-500">%</span></p>
          <p class="mt-1.5 text-[11px] font-bold tracking-[0.14em] text-white/45 uppercase" data-bn="অথেনটিক চেয়ার">Genuine Chairs</p>
        </div>
      </div>
    </section>

    <!-- ======= Categories ======= -->
    <section id="categories" class="bg-base-100 py-10 sm:py-20 lg:py-24">
      <div class="container-x">
        <div class="flex items-end justify-between gap-4" data-reveal>
          <div>
            <p class="eyebrow" data-bn="ক্যাটাগরি">Categories</p>
            <h2 class="section-title title-underline mt-1.5" data-bn="চেয়ারের ধরন অনুযায়ী কিনুন">Shop by Chair Type</h2>
          </div>
          <a href="shop.html" class="link-more hidden sm:inline-flex"><span data-bn="সব দেখুন">View All</span><svg class="size-4"><use href="#i-arrow"/></svg></a>
        </div>
        <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" data-stagger>
${categories
  .map(
    (c) => `          <a href="shop.html?cat=${c.slug}" data-reveal class="group flex flex-col items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg sm:p-6">
            <span class="flex size-14 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-navy-950 group-hover:text-gold-300 sm:size-16"><svg class="size-6.5"><use href="#${c.icon}"/></svg></span>
            <span>
              <span class="block text-[13px] font-bold text-navy-900 sm:text-sm" data-bn="${c.bn}">${c.en}</span>
              <span class="mt-0.5 block text-[11px] font-semibold text-base-content/45" data-bn="${c.countBn}">${c.count}</span>
            </span>
          </a>`
  )
  .join("\n")}
        </div>
        <a href="shop.html" class="link-more mt-6 sm:hidden"><span data-bn="সব চেয়ার দেখুন">View All Chairs</span><svg class="size-4"><use href="#i-arrow"/></svg></a>
      </div>
    </section>

    <!-- ======= Offer + countdown ======= -->
    <section class="relative overflow-hidden bg-[#02101f] py-10 sm:py-20 lg:py-24">
      <img src="assets/img/scenes/home-office.webp" alt="" aria-hidden="true" loading="lazy" class="absolute inset-0 h-full w-full object-cover opacity-[0.16]">
      <div class="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/60" aria-hidden="true"></div>
      <div class="container-x relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div data-reveal>
          <span class="badge border-0 bg-gold-400 font-extrabold text-navy-950" data-bn="সীমিত সময়ের অফার">Limited-Time Offer</span>
          <h2 class="title-underline mt-4 font-display text-[26px] leading-tight font-semibold text-white sm:text-4xl lg:text-[40px]">
            <span data-bn="গ্র্যান্ড চেয়ার সেল — সর্বোচ্চ">Grand Chair Sale — up to</span>
            <span class="text-gold-400" data-bn="${bnNum(Math.max(...products.map((p) => discount(p))))}% ছাড়">${Math.max(...products.map((p) => discount(p)))}% OFF</span>
          </h2>
          <p class="mt-3 max-w-lg text-sm text-white/70 sm:text-base" data-bn="বিকাশ বা নগদে অগ্রিম পেমেন্টে অতিরিক্ত ৫% ছাড়। অফার আজ রাত ১২টায় শেষ!">Extra 5% off on advance payment via bKash or Nagad. Offer ends tonight at 12 AM!</p>
          <div class="mt-6 flex items-center gap-2 sm:gap-3" data-countdown aria-label="Offer countdown">
            <div class="cd-box"><span class="cd-v" data-cd="h">00</span><span class="cd-l" data-bn="ঘণ্টা">Hours</span></div>
            <span class="font-display text-xl font-bold text-gold-400" aria-hidden="true">:</span>
            <div class="cd-box"><span class="cd-v" data-cd="m">00</span><span class="cd-l" data-bn="মিনিট">Minutes</span></div>
            <span class="font-display text-xl font-bold text-gold-400" aria-hidden="true">:</span>
            <div class="cd-box"><span class="cd-v" data-cd="s">00</span><span class="cd-l" data-bn="সেকেন্ড">Seconds</span></div>
          </div>
          <div class="mt-7 flex flex-wrap gap-3">
            <a href="offers.html" class="btn btn-gold font-extrabold"><span data-bn="অফার দেখুন">View Offers</span><svg class="size-4.5"><use href="#i-arrow"/></svg></a>
            <a href="tel:${SITE.phone}" class="btn border-white/25 bg-transparent font-bold text-white hover:border-white hover:bg-white/10"><svg class="size-4.5"><use href="#i-phone"/></svg><span>${SITE.phoneDisplay}</span></a>
          </div>
        </div>
        <div class="hidden lg:block" data-reveal>
          <img src="assets/img/banner-gck-navy.webp" alt="Golden Chair King — অর্ডার করতে ইনবক্স করুন বা কল করুন" loading="lazy" class="mx-auto w-full max-w-[300px] rounded-3xl border border-gold-400/30 shadow-[0_0_0_1px_rgba(233,199,134,0.14),0_28px_60px_-20px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
        </div>
      </div>
    </section>

    <!-- ======= Latest collection ======= -->
    <section class="bg-base-100 py-10 sm:py-20 lg:py-24" id="latest">
      <div class="container-x">
        <div class="flex items-end justify-between gap-4" data-reveal>
          <div>
            <p class="eyebrow" data-bn="নতুন এসেছে">New Arrivals</p>
            <h2 class="section-title title-underline mt-1.5" data-bn="সর্বশেষ কালেকশন">Latest Collection</h2>
          </div>
          <a href="shop.html" class="link-more hidden sm:inline-flex"><span data-bn="আরও দেখুন">See More</span><svg class="size-4"><use href="#i-arrow"/></svg></a>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-stagger>
${latest.map((p) => productCard(p)).join("\n\n")}
        </div>

        <div class="mt-8 text-center">
          <a href="shop.html" class="btn btn-outline btn-wide font-bold"><span data-bn="সব চেয়ার দেখুন">View All Chairs</span><svg class="size-4.5"><use href="#i-arrow"/></svg></a>
        </div>
      </div>
    </section>

    <!-- ======= Hot deals (mobile swipe scroller) ======= -->
    <section class="bg-base-200/50 py-10 sm:py-20">
      <div class="container-x">
        <div class="flex items-end justify-between gap-4" data-reveal>
          <div>
            <p class="eyebrow" data-bn="দ্রুত লুফে নিন">Grab Them Fast</p>
            <h2 class="section-title title-underline mt-1.5" data-bn="হট ডিল">Hot Deals</h2>
          </div>
          <a href="offers.html" class="link-more hidden sm:inline-flex"><span data-bn="সব অফার">All Offers</span><svg class="size-4"><use href="#i-arrow"/></svg></a>
        </div>
        <div class="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
${deals.map((p) => productCard(p, { deal: true })).join("\n\n")}
        </div>
        <p class="mt-2 text-center text-xs font-semibold text-base-content/40 sm:hidden" data-bn="← ডানে-বায়ে সোয়াইপ করুন →">← Swipe to explore →</p>
      </div>
    </section>

    <!-- ======= Why choose us ======= -->
    <section class="bg-base-100 py-10 sm:py-20 lg:py-24">
      <div class="container-x">
        <div class="text-center" data-reveal>
          <p class="eyebrow" data-bn="কেন গোল্ডেন চেয়ার কিং">Why Golden Chair King</p>
          <h2 class="section-title title-underline title-underline-center mt-1.5" data-bn="আমাদের কেন বেছে নেবেন">Why Choose Us</h2>
        </div>
        <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-stagger>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-shield"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="অথেনটিক ওয়ারেন্টি">Genuine Warranty</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="নির্বাচিত পণ্যে ১ বছর পর্যন্ত রিপ্লেসমেন্ট ওয়ারেন্টি।">Up to 1-year replacement warranty on selected items.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-truck"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="সারা দেশে ডেলিভারি">Nationwide Delivery</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="৬৪ জেলায় দ্রুত ও যত্নসহ ডেলিভারি।">Fast &amp; careful delivery to all 64 districts.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-rotate"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="৭ দিনের সহজ এক্সচেঞ্জ">7-Day Easy Exchange</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="পছন্দ হয়নি? ৭ দিনের মধ্যে ঝামেলাহীন এক্সচেঞ্জ।">Not satisfied? Exchange within 7 days, hassle-free.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-tag"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="সেরা দামের গ্যারান্টি">Best Price Guarantee</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="সরাসরি শোরুমের দাম — কোনো মধ্যস্বত্বভোগী নেই।">Direct showroom prices — no middlemen.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======= Testimonials ======= -->
    <section class="bg-navy-950 py-10 sm:py-20 lg:py-24">
      <div class="container-x">
        <div class="text-center" data-reveal>
          <p class="eyebrow" data-bn="কাস্টমার রিভিউ">Customer Reviews</p>
          <h2 class="section-title title-underline title-underline-center mt-1.5 !text-white" data-bn="ক্রেতারা যা বলছেন">What Our Customers Say</h2>
        </div>
        <div class="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0" data-stagger>
          <figure class="quote-card relative w-[82vw] shrink-0 snap-start rounded-2xl border border-gold-400/15 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-gold-400/30 md:w-auto" data-reveal>
            <div class="flex gap-0.5 text-gold-400" aria-label="Rated 5 out of 5"><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg></div>
            <blockquote class="mt-4 text-sm leading-relaxed text-white/85">“Ordered 6 executive chairs for our office. Delivery was fast and the quality is honestly better than I expected at this price. Highly recommended!”</blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-full bg-gold-400 font-display font-bold text-navy-950">R</span>
              <span>
                <span class="block font-display text-[13px] font-semibold tracking-[0.04em] text-white">Rakib Hasan</span>
                <span class="block text-xs text-white/50" data-bn="উত্তরা, ঢাকা">Uttara, Dhaka</span>
              </span>
            </figcaption>
          </figure>
          <figure class="quote-card relative w-[82vw] shrink-0 snap-start rounded-2xl border border-gold-400/15 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-gold-400/30 md:w-auto" data-reveal>
            <div class="flex gap-0.5 text-gold-400" aria-label="Rated 5 out of 5"><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg></div>
            <blockquote class="mt-4 text-sm leading-relaxed text-white/85">“The office chair arrived well-packed and exactly like the photos. Their WhatsApp support answered every question before I ordered.”</blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-full bg-gold-400 font-display font-bold text-navy-950">N</span>
              <span>
                <span class="block font-display text-[13px] font-semibold tracking-[0.04em] text-white">Nusrat Jahan</span>
                <span class="block text-xs text-white/50" data-bn="চট্টগ্রাম">Chattogram</span>
              </span>
            </figcaption>
          </figure>
          <figure class="quote-card relative w-[82vw] shrink-0 snap-start rounded-2xl border border-gold-400/15 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-gold-400/30 md:w-auto" data-reveal>
            <div class="flex gap-0.5 text-gold-400" aria-label="Rated 4.5 out of 5"><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4 opacity-30"><use href="#i-star"/></svg></div>
            <blockquote class="mt-4 text-sm leading-relaxed text-white/85">“Ordered two staff chairs and one boss chair for our office. Solid build, fair price, and the exchange policy gave me confidence.”</blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-full bg-gold-400 font-display font-bold text-navy-950">M</span>
              <span>
                <span class="block font-display text-[13px] font-semibold tracking-[0.04em] text-white">Mahmudul Islam</span>
                <span class="block text-xs text-white/50" data-bn="মিরপুর, ঢাকা">Mirpur, Dhaka</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ======= Showroom + map ======= -->
    <section id="showroom" class="bg-base-100 py-10 sm:py-20 lg:py-24">
      <div class="container-x grid items-center gap-10 lg:grid-cols-2">
        <div class="reveal-left" data-reveal>
          <p class="eyebrow" data-bn="শোরুম">Visit Us</p>
          <h2 class="section-title mt-1.5" data-bn="শোরুমে ঘুরে দেখুন">Visit Our Showroom</h2>
          <p class="mt-3 max-w-lg text-sm leading-relaxed text-base-content/65 sm:text-base" data-bn="কেনার আগে চেয়ার নিজে দেখুন ও বসে পরখ করুন — আপনার অফিসের জন্য সঠিক চেয়ার বেছে নিতে আমাদের টিম পাশে থাকবে।">See and test the chairs in person before you buy — our team will help you choose the right seating for your office.</p>
          <ul class="mt-7 space-y-4">
            <li class="flex items-start gap-3.5">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-400"><svg class="size-5"><use href="#i-pin"/></svg></span>
              <span>
                <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="আমাদের শোরুম">Our Showroom</span>
                <span class="mt-0.5 block text-sm font-bold text-navy-900">${SITE.address}</span>
              </span>
            </li>
            <li class="flex items-start gap-3.5">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-400"><svg class="size-5"><use href="#i-clock"/></svg></span>
              <span>
                <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="খোলার সময়">Open Hours</span>
                <span class="mt-0.5 block text-sm font-bold text-navy-900" data-bn="${SITE.hoursBn}">${SITE.hours}</span>
              </span>
            </li>
            <li class="flex items-start gap-3.5">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-gold-400"><svg class="size-5"><use href="#i-phone"/></svg></span>
              <span>
                <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="কল / হোয়াটসঅ্যাপ">Call / WhatsApp</span>
                <a href="tel:${SITE.phone}" class="mt-0.5 block text-sm font-bold text-navy-900 hover:text-primary">${SITE.phoneDisplay}</a>
              </span>
            </li>
          </ul>
          <div class="mt-7 flex flex-wrap gap-3">
            <a href="https://maps.google.com/?q=South+Jatrabari,+Dhaka,+Bangladesh" target="_blank" rel="noopener" class="btn btn-primary font-bold"><svg class="size-4.5"><use href="#i-pin"/></svg><span data-bn="ম্যাপে দেখুন">Get Directions</span></a>
            <a href="tel:${SITE.phone}" class="btn btn-outline font-bold"><svg class="size-4.5"><use href="#i-phone"/></svg><span data-bn="এখনই কল করুন">Call Now</span></a>
          </div>
        </div>
        <div class="reveal-right" data-reveal>
          <iframe src="https://www.google.com/maps?q=South+Jatrabari,+Dhaka,+Bangladesh&amp;output=embed" class="h-72 w-full rounded-3xl border border-base-300 shadow-sm lg:h-96" loading="lazy" title="Map — ${SITE.name} showroom, South Jatrabari, Dhaka" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>

    <!-- ======= WhatsApp CTA band ======= -->
    <section class="bg-base-100 pb-12 sm:pb-16 lg:pb-20">
      <div class="container-x">
        <div class="frame-inner relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-9 sm:px-10 sm:py-12" data-reveal>
          <div class="pointer-events-none absolute -top-16 right-0 size-64 rounded-full bg-gold-500/20 blur-[90px]" aria-hidden="true"></div>
          <div class="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 class="font-display text-xl font-semibold text-white sm:text-2xl" data-bn="সঠিক চেয়ার বেছে নিতে সাহায্য দরকার?">Need help choosing the right chair?</h2>
              <p class="mt-2 max-w-xl text-sm text-white/70" data-bn="হোয়াটসঅ্যাপে আমাদের টিমের সাথে কথা বলুন — দ্রুত উত্তর, সৎ পরামর্শ, আর সেরা ডিল।">Chat with our team on WhatsApp — quick replies, honest advice and the best deals.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <a href="https://wa.me/${SITE.wa}?text=Assalamu%20Alaikum!%20I%20need%20help%20choosing%20a%20chair." target="_blank" rel="noopener" class="btn border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে চ্যাট">Chat on WhatsApp</span></a>
              <a href="tel:${SITE.phone}" class="btn border-white/30 bg-transparent font-bold text-white hover:border-white hover:bg-white hover:text-navy-950"><svg class="size-4.5"><use href="#i-phone"/></svg><span data-bn="কল করুন">Call Now</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- ======= Footer ======= -->
${footer()}

  <!-- ======= Floating buttons (desktop) ======= -->
${floatingButtons()}

  <!-- ======= Mobile bottom nav ======= -->
${bottomNav("home")}

  <script src="assets/js/site.js?v=${ASSET_V}" defer></script>
</body>
</html>
`;

/* ============================================================
   Shared shell for inner pages
   ============================================================ */

const promoBar = () => `
  <div class="border-b border-gold-400/10 bg-navy-950 text-[11px] font-semibold text-white/80 sm:text-xs">
    <div class="container-x flex h-9 items-center justify-between gap-3 sm:h-10">
      <p class="flex min-w-0 items-center gap-2">
        <svg class="size-3.5 shrink-0 text-gold-400"><use href="#i-truck"/></svg>
        <span class="truncate" data-bn="সারা বাংলাদেশে ডেলিভারি — ক্যাশ অন ডেলিভারি সুবিধা">Nationwide delivery across Bangladesh — Cash on Delivery available</span>
      </p>
      <a href="tel:${SITE.phone}" class="flex shrink-0 items-center gap-1.5 text-gold-300 transition-colors hover:text-gold-400">
        <svg class="size-3.5"><use href="#i-phone"/></svg>
        <span data-bn="কাস্টমার কেয়ার:">Customer Care:</span> ${SITE.phoneDisplay}
      </a>
    </div>
  </div>`;

const shellTop = (active, meta) => `<!doctype html>
<html lang="en" data-theme="gck" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.desc}">
  <link rel="canonical" href="${meta.canonical}">
  <meta name="robots" content="${meta.robots || "index, follow, max-image-preview:large"}">
  <meta name="theme-color" content="#03182D">
  <meta name="author" content="${SITE.name}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.desc}">
  <meta property="og:url" content="${meta.canonical}">
  <meta property="og:image" content="${meta.ogImage || SITE.domain + "/assets/img/og-image.jpg"}">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="bn_BD">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" href="assets/img/favicon.png" sizes="any">
  <link rel="icon" href="assets/img/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&amp;family=Montserrat:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/site.css?v=${ASSET_V}">
${meta.jsonLd ? `  <script type="application/ld+json">\n${meta.jsonLd}\n  </script>\n` : ""}</head>

<body class="has-bottom-nav bg-base-100 font-sans text-base-content antialiased">

  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-gold-400 focus:px-4 focus:py-2 focus:font-bold focus:text-navy-950">Skip to content</a>

${sprite}

${promoBar()}

${header(active)}

${mobileMenu()}

${cartDrawer()}

${overlays()}

  <main id="main">`;

const shellBottom = (active) => `  </main>

${footer()}

${floatingButtons()}

${bottomNav(active)}

  <script src="assets/js/site.js?v=${ASSET_V}" defer></script>
</body>
</html>
`;

const crumbParts = (crumbs, dark) => {
  const parts = [];
  crumbs.forEach((c, i) => {
    if (i > 0) parts.push(`<svg class="size-3 shrink-0 -rotate-90 ${dark ? "text-gold-500/60" : "text-base-content/30"}" aria-hidden="true"><use href="#i-chevron"/></svg>`);
    if (c[1] && i < crumbs.length - 1) {
      parts.push(dark
        ? `<a href="${c[1]}" class="transition-colors hover:text-gold-300">${c[0]}</a>`
        : `<a href="${c[1]}" class="transition-colors hover:text-gold-700">${c[0]}</a>`);
    } else {
      parts.push(dark ? `<span class="text-gold-300">${c[0]}</span>` : `<span class="text-navy-900">${c[0]}</span>`);
    }
  });
  return parts.join(" ");
};
const crumbNav = (crumbs) => `        <nav class="hero-anim d1 mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide text-white/50 uppercase" aria-label="Breadcrumb">${crumbParts(crumbs, true)}</nav>`;
const crumbLight = (crumbs) => `      <nav class="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide text-base-content/45 uppercase" aria-label="Breadcrumb">${crumbParts(crumbs, false)}</nav>`;

const breadcrumbLd = (crumbs) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c[0],
    ...(c[1] && i < crumbs.length - 1 ? { item: SITE.domain + "/" + (c[1] === "index.html" ? "" : c[1]) } : {}),
  })),
});

const pageHero = ({ eyebrow, eyebrowBn, title, titleBn, sub, crumbs }) => `
    <section class="relative overflow-hidden bg-[#02101f]">
      <div class="pointer-events-none absolute -top-24 right-[-5%] size-[360px] rounded-full bg-gold-500/12 blur-[110px]" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(233,199,134,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(65%_70%_at_60%_35%,black,transparent)]" aria-hidden="true"></div>
      <div class="container-x relative py-10 sm:py-14">
${crumbs ? crumbNav(crumbs) : ""}
        <p class="hero-anim d1 eyebrow" data-bn="${eyebrowBn}">${eyebrow}</p>
        <h1 class="hero-anim d2 mt-2 font-display text-[26px] font-semibold text-white sm:text-4xl" data-bn="${titleBn}">${title}</h1>
${sub ? `        <p class="hero-anim d3 mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">${sub}</p>` : ""}
      </div>
    </section>`;

const starsLg = (p) => `<span class="flex gap-0.5 text-gold-500" aria-label="Rated ${p.rating} out of 5"><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4"><use href="#i-star"/></svg><svg class="size-4${p.rating < 5 ? " opacity-30" : ""}"><use href="#i-star"/></svg></span>`;

/* ---------------- shop page ---------------- */

const shopPage = () => shellTop("shop", {
  title: "All Chairs — Executive, Boss, Ergonomic & Staff Chairs in Dhaka | Golden Chair King",
  desc: "Browse all office chairs at Golden Chair King — executive & boss chairs, wooden boss chairs, ergonomic mesh and staff chairs. Prices in BDT, nationwide delivery.",
  canonical: SITE.domain + "/shop.html",
  jsonLd: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Chairs — Golden Chair King",
    url: SITE.domain + "/shop.html",
    isPartOf: { "@id": SITE.domain + "/#website" },
  }),
}) + `
${pageHero({
  eyebrow: "Shop",
  eyebrowBn: "শপ",
  title: "All Chairs",
  titleBn: "সব চেয়ার",
  sub: `${products.length} hand-picked office chairs — filter by type, price or search by name.`,
  crumbs: [["Home", "index.html"], ["Shop", null]],
})}

    <section class="container-x py-10 sm:py-14">
      <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label class="relative flex-1">
            <input id="shop-search" type="search" placeholder="Search chairs…" data-bn-ph="চেয়ার খুঁজুন…" class="input w-full border-base-300 bg-white pl-9 text-sm" aria-label="Search chairs">
            <svg class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-base-content/40"><use href="#i-search"/></svg>
          </label>
          <select id="shop-sort" class="select w-full border-base-300 bg-white text-sm font-semibold sm:w-56" aria-label="Sort chairs">
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="discount">Biggest discount</option>
            <option value="rating">Top rated</option>
          </select>
          <button id="shop-clear" type="button" class="btn btn-outline font-bold"><span data-bn="রিসেট">Clear</span></button>
        </div>
        <div class="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <button type="button" data-cat-filter="" class="shop-chip active"><span data-bn="সব চেয়ার">All Chairs</span></button>
${categories.map((c) => `          <button type="button" data-cat-filter="${c.slug}" class="shop-chip"><span data-bn="${c.bn}">${c.en}</span></button>`).join("\n")}
          <button type="button" data-deal-filter class="shop-chip"><span data-bn="অফারে">On Offer</span></button>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="text-xs font-bold text-base-content/50" data-bn="দাম (৳):">Price (৳):</span>
          <input id="shop-min" type="number" min="0" placeholder="Min" class="input input-sm w-24 border-base-300 bg-white text-sm" aria-label="Minimum price">
          <span class="text-base-content/30">—</span>
          <input id="shop-max" type="number" min="0" placeholder="Max" class="input input-sm w-24 border-base-300 bg-white text-sm" aria-label="Maximum price">
        </div>
      </div>

      <p id="shop-count" class="mt-6 text-sm font-bold text-base-content/60">Showing ${products.length} of ${products.length} chairs</p>

      <div id="shop-grid" class="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
${products.map((p) => productCard(p)).join("\n\n")}
      </div>

      <div id="shop-empty" class="hidden rounded-3xl border border-base-300 bg-base-100 p-10 text-center">
        <p class="font-display text-xl text-navy-900" data-bn="কিছু পাওয়া যায়নি">No chairs match your filters</p>
        <p class="mt-2 text-sm text-base-content/60" data-bn="ফিল্টার বদলে আবার চেষ্টা করুন।">Try changing the filters or search again.</p>
        <button id="shop-empty-clear" type="button" class="btn btn-gold mt-5 font-bold" data-bn="ফিল্টার রিসেট করুন">Reset filters</button>
      </div>
    </section>
` + shellBottom("shop");

/* ---------------- product pages ---------------- */

const productLd = (p) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  image: p.photos.map((ph) => SITE.domain + "/" + ph),
  description: p.desc,
  sku: p.slug,
  brand: { "@type": "Brand", name: SITE.name },
  aggregateRating: { "@type": "AggregateRating", ratingValue: String(p.rating), reviewCount: String(p.reviews) },
  offers: {
    "@type": "Offer",
    url: `${SITE.domain}/product/${p.slug}.html`,
    price: String(p.price),
    priceCurrency: "BDT",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: SITE.name },
  },
});

const productPage = (p) => {
  const cat = categories.find((c) => c.slug === p.cat);
  const crumbs = [["Home", "index.html"], ["Shop", "shop.html"], [cat.en, `shop.html?cat=${p.cat}`], [p.name, null]];
  let related = products.filter((x) => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
  if (related.length < 4) {
    const more = products.filter((x) => x.slug !== p.slug && !related.some((r) => r.slug === x.slug)).slice(0, 4 - related.length);
    related = related.concat(more);
  }
  return shellTop("shop", {
    title: `${p.name} — ${money(p.price)} | ${SITE.name} Dhaka`,
    desc: p.desc.slice(0, 158),
    canonical: `${SITE.domain}/product/${p.slug}.html`,
    ogImage: SITE.domain + "/" + p.photos[0],
    jsonLd: productLd(p) + "\n" + breadcrumbLd(crumbs),
  }) + `
    <section class="container-x py-8 sm:py-12">
${crumbLight(crumbs)}
      <div class="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div class="shine group relative overflow-hidden rounded-3xl border border-base-300 bg-white shadow-sm">
            <img id="gallery-main" src="${p.photos[0]}" alt="${p.alt}" width="1000" height="1000" class="img-fade aspect-square h-auto w-full object-cover">
            <span class="absolute top-4 left-4 rounded-full bg-navy-950 px-3 py-1.5 text-[11px] font-extrabold text-gold-300">−${discount(p)}%</span>
          </div>
${p.photos.length > 1 ? `          <div class="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
${p.photos.map((ph, i) => `            <button type="button" data-gallery-thumb data-src="${ph}" class="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white transition-all hover:border-gold-400 ${i === 0 ? "border-gold-400 ring-2 ring-gold-400/40" : "border-base-300"}" aria-label="View photo ${i + 1}">
              <img src="${ph}" alt="${p.name} — photo ${i + 1}" width="160" height="160" loading="lazy" class="h-full w-full object-cover">
            </button>`).join("\n")}
          </div>
` : ""}        </div>

        <div>
          <p class="text-[11px] font-extrabold tracking-[0.2em] text-gold-600 uppercase" data-bn="${cat.bn}">${cat.en}</p>
          <h1 class="mt-2 font-display text-2xl leading-tight font-semibold text-navy-900 sm:text-3xl">${p.name}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            ${starsLg(p)}
            <span class="text-xs font-bold text-base-content/50">${p.rating.toFixed(1)} (${p.reviews} <span data-bn="রিভিউ">reviews</span>)</span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-extrabold text-success"><span class="size-1.5 rounded-full bg-success"></span><span data-bn="স্টকে আছে">In Stock</span></span>
          </div>
          <div class="mt-5 flex flex-wrap items-end gap-3 border-y border-base-300 py-5">
            <span class="font-display text-3xl font-bold text-navy-900">${money(p.price)}</span>
            <span class="text-base font-semibold text-base-content/35 line-through">${money(p.oldPrice)}</span>
            <span class="rounded-full bg-gold-100 px-3 py-1 text-[11px] font-extrabold text-gold-700"><span data-bn="সেভ করুন">Save</span> ${money(p.oldPrice - p.price)}</span>
          </div>
          <p class="mt-5 text-sm leading-relaxed text-base-content/70">${p.desc}</p>

          <div class="mt-6 flex flex-wrap items-stretch gap-3">
            <div class="join rounded-xl border border-base-300 bg-base-100">
              <button type="button" class="join-item btn btn-sm px-3" data-qty-dec="qty-input" aria-label="Decrease quantity"><svg class="size-3.5"><use href="#i-minus"/></svg></button>
              <input id="qty-input" type="text" inputmode="numeric" value="1" class="join-item w-12 border-0 bg-transparent text-center text-sm font-bold text-navy-900 focus:outline-none" aria-label="Quantity">
              <button type="button" class="join-item btn btn-sm px-3" data-qty-inc="qty-input" aria-label="Increase quantity"><svg class="size-3.5"><use href="#i-plus"/></svg></button>
            </div>
            <button type="button" data-add data-id="${p.slug}" data-name="${p.name}" data-name-bn="${p.nameBn}" data-price="${p.price}" data-img="${p.photos[0]}" data-qty-from="#qty-input" class="btn flex-1 border border-gold-400/40 bg-navy-950 font-bold text-gold-300 transition-colors hover:border-gold-400 hover:bg-navy-800 hover:text-gold-200">
              <svg class="size-4.5"><use href="#i-cart"/></svg><span class="text-[11px] font-extrabold tracking-wider" data-bn="কার্টে যোগ করুন">Add to Cart</span>
            </button>
            <button type="button" data-buy-now data-id="${p.slug}" data-name="${p.name}" data-name-bn="${p.nameBn}" data-price="${p.price}" data-img="${p.photos[0]}" data-qty-from="#qty-input" class="btn btn-gold font-extrabold"><span data-bn="এখনই কিনুন">Buy Now</span></button>
          </div>
          <a href="https://wa.me/${SITE.wa}?text=${encodeURIComponent("Assalamu Alaikum! I want to order: " + p.name + " — ৳" + p.price.toLocaleString("en-IN"))}" target="_blank" rel="noopener" class="btn mt-3 w-full border-[#25D366]/50 bg-transparent font-bold text-[#128C4B] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white">
            <svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে অর্ডার করুন">Order on WhatsApp</span>
          </a>

          <ul class="mt-6 space-y-3 rounded-2xl border border-base-300 bg-base-200/40 p-5 text-[13px] font-semibold text-base-content/70">
            <li class="flex gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-600"><use href="#i-truck"/></svg><span data-bn="ঢাকায় ২৪–৪৮ ঘণ্টায় ডেলিভারি, সারা দেশে ২–৪ দিন।">Dhaka delivery in 24–48 hours, nationwide in 2–4 days.</span></li>
            <li class="flex gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-600"><use href="#i-shield"/></svg><span data-bn="নির্বাচিত পণ্যে ১ বছর পর্যন্ত রিপ্লেসমেন্ট ওয়ারেন্টি।">Up to 1-year replacement warranty on selected items.</span></li>
            <li class="flex gap-2.5"><svg class="mt-0.5 size-4 shrink-0 text-gold-600"><use href="#i-rotate"/></svg><span data-bn="৭ দিনের সহজ এক্সচেঞ্জ।">7-day easy exchange — see <a href="refund-exchange.html" class="font-bold text-gold-700 underline underline-offset-2">policy</a>.</span></li>
          </ul>

          <details class="group mt-4 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
            <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-navy-900">
              <span data-bn="স্পেসিফিকেশন">Specifications</span>
              <svg class="size-4 text-gold-600 transition-transform group-open:rotate-180"><use href="#i-chevron"/></svg>
            </summary>
            <table class="w-full border-t border-base-300 text-sm">
              <tbody>
${p.specs.map(([k, v]) => `                <tr class="border-b border-base-200 last:border-0"><td class="w-2/5 px-5 py-3 font-bold text-base-content/50">${k}</td><td class="px-5 py-3 font-semibold text-navy-900">${v}</td></tr>`).join("\n")}
              </tbody>
            </table>
          </details>
          <details class="group mt-3 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
            <summary class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-navy-900">
              <span data-bn="ডেলিভারি ও পেমেন্ট">Delivery &amp; payment</span>
              <svg class="size-4 text-gold-600 transition-transform group-open:rotate-180"><use href="#i-chevron"/></svg>
            </summary>
            <div class="space-y-2 border-t border-base-300 px-5 py-4 text-[13px] leading-relaxed text-base-content/70">
              <p>Inside Dhaka: ৳200–500 depending on area · Outside Dhaka: ৳500–1,200 by district — final charge confirmed on WhatsApp before dispatch.</p>
              <p>Pay by Cash on Delivery, bKash or Nagad. Advance payment by bKash/Nagad gets an extra 5% off during offers.</p>
              <p>Full details on the <a href="delivery.html" class="font-bold text-gold-700 underline underline-offset-2">Delivery &amp; Shipping</a> page.</p>
            </div>
          </details>
        </div>
      </div>

      <div class="mt-14">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow" data-bn="আরও দেখুন">More to explore</p>
            <h2 class="section-title title-underline mt-1.5" data-bn="এগুলোও ভালো লাগতে পারে">You may also like</h2>
          </div>
          <a href="shop.html" class="link-more hidden sm:inline-flex"><span data-bn="সব চেয়ার">All Chairs</span><svg class="size-4"><use href="#i-arrow"/></svg></a>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
${related.map((rp) => productCard(rp)).join("\n\n")}
        </div>
      </div>
    </section>
` + shellBottom("shop");
};

/* ---------------- cart page ---------------- */

const payChipsLight = () => `
            <div class="mt-5 flex flex-wrap justify-center gap-2">
              <span class="rounded-lg border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-bold text-base-content/60">bKash</span>
              <span class="rounded-lg border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-bold text-base-content/60">Nagad</span>
              <span class="rounded-lg border border-base-300 bg-base-100 px-2.5 py-1 text-[11px] font-bold text-base-content/60" data-bn="ক্যাশ অন ডেলিভারি">Cash on Delivery</span>
            </div>`;

const cartPage = () => shellTop("", {
  title: "Your Cart — Golden Chair King",
  desc: "Review the chairs in your cart and continue to checkout. Nationwide delivery, cash on delivery, bKash & Nagad.",
  canonical: SITE.domain + "/cart.html",
  robots: "noindex, follow",
}) + `
${pageHero({
  eyebrow: "Cart",
  eyebrowBn: "কার্ট",
  title: "Your Cart",
  titleBn: "আপনার কার্ট",
  sub: "Review your chairs, then continue to checkout.",
  crumbs: [["Home", "index.html"], ["Cart", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div id="cart-page-items" class="space-y-4"></div>
        <aside class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm lg:sticky lg:top-24">
          <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="অর্ডার সামারি">Order Summary</h2>
          <div class="mt-4 space-y-3 border-b border-base-300 pb-4 text-sm">
            <div class="flex items-center justify-between font-bold text-navy-900"><span data-bn="সাবটোটাল">Subtotal</span><span id="cart-page-subtotal" class="font-display text-base">৳0</span></div>
            <div class="flex items-center justify-between text-base-content/60"><span data-bn="ডেলিভারি চার্জ">Delivery</span><span class="text-right text-xs" data-bn="চেকআউটে জানানো হবে">Calculated at checkout</span></div>
          </div>
          <div class="mt-4 flex items-center justify-between font-bold text-navy-900"><span data-bn="মোট">Total</span><span id="cart-page-total" class="font-display text-lg text-gold-700">৳0</span></div>
          <a href="checkout.html" id="cart-checkout-btn" class="btn btn-gold mt-5 w-full font-extrabold" data-bn="চেকআউটে যান">Proceed to Checkout</a>
          <a href="shop.html" class="btn btn-outline mt-3 w-full font-bold" data-bn="শপিং চালিয়ে যান">Continue Shopping</a>
${payChipsLight()}
        </aside>
      </div>
    </section>
` + shellBottom("");

/* ---------------- checkout page ---------------- */

const checkoutPage = () => shellTop("", {
  title: "Checkout — Golden Chair King",
  desc: "Place your chair order — cash on delivery, bKash or Nagad. We confirm every order on WhatsApp.",
  canonical: SITE.domain + "/checkout.html",
  robots: "noindex, follow",
}) + `
${pageHero({
  eyebrow: "Checkout",
  eyebrowBn: "চেকআউট",
  title: "Checkout",
  titleBn: "চেকআউট",
  sub: "Fill in your details — your order opens in WhatsApp for instant confirmation. Delivery charge is confirmed before dispatch.",
  crumbs: [["Home", "index.html"], ["Cart", "cart.html"], ["Checkout", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <form id="checkout-form" novalidate class="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div class="space-y-6">
          <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="আপনার তথ্য">Your details</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-xs font-bold text-base-content/60" data-bn="নাম *">Full name *</span>
                <input id="co-name" type="text" autocomplete="name" class="input mt-1 w-full border-base-300 bg-white" placeholder="Your name">
                <span id="err-name" class="mt-1 hidden text-xs font-bold text-error" data-bn="নাম লিখুন">Please enter your name</span>
              </label>
              <label class="block">
                <span class="text-xs font-bold text-base-content/60" data-bn="মোবাইল নম্বর *">Mobile number *</span>
                <input id="co-phone" type="tel" inputmode="tel" autocomplete="tel" class="input mt-1 w-full border-base-300 bg-white" placeholder="01XXXXXXXXX">
                <span id="err-phone" class="mt-1 hidden text-xs font-bold text-error" data-bn="সঠিক মোবাইল নম্বর দিন">Enter a valid BD mobile number</span>
              </label>
              <label class="block sm:col-span-2">
                <span class="text-xs font-bold text-base-content/60" data-bn="ইমেইল (ঐচ্ছিক)">Email (optional)</span>
                <input id="co-email" type="email" autocomplete="email" class="input mt-1 w-full border-base-300 bg-white" placeholder="you@example.com">
              </label>
            </div>
          </div>

          <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="ডেলিভারি ঠিকানা">Delivery address</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="block sm:col-span-2">
                <span class="text-xs font-bold text-base-content/60" data-bn="ঠিকানা *">Full address *</span>
                <input id="co-address" type="text" autocomplete="street-address" class="input mt-1 w-full border-base-300 bg-white" placeholder="House / road / area">
                <span id="err-address" class="mt-1 hidden text-xs font-bold text-error" data-bn="ঠিকানা লিখুন">Please enter your address</span>
              </label>
              <label class="block">
                <span class="text-xs font-bold text-base-content/60" data-bn="জেলা / বিভাগ *">District / Division *</span>
                <select id="co-district" class="select mt-1 w-full border-base-300 bg-white">
                  <option value="">Select district…</option>
                  <option>Dhaka</option>
                  <option>Chattogram</option>
                  <option>Khulna</option>
                  <option>Rajshahi</option>
                  <option>Barishal</option>
                  <option>Sylhet</option>
                  <option>Rangpur</option>
                  <option>Mymensingh</option>
                  <option>Other district</option>
                </select>
                <span id="err-district" class="mt-1 hidden text-xs font-bold text-error" data-bn="জেলা সিলেক্ট করুন">Please select your district</span>
              </label>
              <label class="block">
                <span class="text-xs font-bold text-base-content/60" data-bn="থানা / এলাকা">Thana / Area</span>
                <input id="co-area" type="text" class="input mt-1 w-full border-base-300 bg-white" placeholder="e.g. Jatrabari">
              </label>
              <label class="block sm:col-span-2">
                <span class="text-xs font-bold text-base-content/60" data-bn="অর্ডার নোট (ঐচ্ছিক)">Order note (optional)</span>
                <textarea id="co-note" rows="2" class="textarea mt-1 w-full border-base-300 bg-white" placeholder="Colour choice, delivery time, floor number…"></textarea>
              </label>
            </div>
          </div>

          <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="পেমেন্ট মাধ্যম">Payment method</h2>
            <div class="mt-4 space-y-3">
              <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 transition-colors has-[:checked]:border-gold-400 has-[:checked]:bg-gold-100/50">
                <input type="radio" name="payment" value="cod" class="radio radio-sm mt-0.5" checked>
                <span>
                  <span class="block text-sm font-bold text-navy-900" data-bn="ক্যাশ অন ডেলিভারি">Cash on Delivery</span>
                  <span class="mt-0.5 block text-xs text-base-content/60" data-bn="চেয়ার হাতে পেয়ে টাকা দিন।">Pay in cash when the chair reaches you.</span>
                </span>
              </label>
              <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 transition-colors has-[:checked]:border-gold-400 has-[:checked]:bg-gold-100/50">
                <input type="radio" name="payment" value="bkash" class="radio radio-sm mt-0.5">
                <span>
                  <span class="block text-sm font-bold text-navy-900">bKash — <span data-bn="অগ্রিম পেমেন্ট">advance payment</span></span>
                  <span class="mt-0.5 block text-xs text-base-content/60" data-bn="বিকাশে সেন্ড মানি করে TrxID দিন — অফারে অতিরিক্ত ৫% ছাড়।">Send money on bKash and enter the TrxID — extra 5% off in offers.</span>
                </span>
              </label>
              <div data-pay-panel="bkash" class="hidden rounded-2xl border border-gold-400/40 bg-gold-100/40 p-4">
                <p class="text-sm font-bold text-navy-900" data-bn="বিকাশ সেন্ড মানি">Send money on bKash (personal)</p>
                <ol class="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-base-content/75">
                  <li>Open bKash → Send Money → <b>${SITE.phoneDisplay}</b>.</li>
                  <li>Send the full amount, then copy the <b>TrxID</b> from the confirmation SMS.</li>
                  <li>Paste it below — we verify before dispatch.</li>
                </ol>
                <label class="mt-3 block">
                  <span class="text-xs font-bold text-base-content/60">bKash TrxID *</span>
                  <input id="co-trx-bkash" type="text" class="input mt-1 w-full border-base-300 bg-white" placeholder="e.g. 8N7A2C1D9E">
                </label>
                <span id="err-trx-bkash" class="mt-1 hidden text-xs font-bold text-error" data-bn="TrxID দিন">Enter your bKash TrxID</span>
              </div>
              <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 transition-colors has-[:checked]:border-gold-400 has-[:checked]:bg-gold-100/50">
                <input type="radio" name="payment" value="nagad" class="radio radio-sm mt-0.5">
                <span>
                  <span class="block text-sm font-bold text-navy-900">Nagad — <span data-bn="অগ্রিম পেমেন্ট">advance payment</span></span>
                  <span class="mt-0.5 block text-xs text-base-content/60" data-bn="নগদে সেন্ড মানি করে TrxID দিন।">Send money on Nagad and enter the TrxID.</span>
                </span>
              </label>
              <div data-pay-panel="nagad" class="hidden rounded-2xl border border-gold-400/40 bg-gold-100/40 p-4">
                <p class="text-sm font-bold text-navy-900" data-bn="নগদ সেন্ড মানি">Send money on Nagad</p>
                <ol class="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-base-content/75">
                  <li>Open Nagad → Send Money → <b>${SITE.phoneDisplay}</b>.</li>
                  <li>Send the full amount, then copy the <b>TrxID</b>.</li>
                  <li>Paste it below — we verify before dispatch.</li>
                </ol>
                <label class="mt-3 block">
                  <span class="text-xs font-bold text-base-content/60">Nagad TrxID *</span>
                  <input id="co-trx-nagad" type="text" class="input mt-1 w-full border-base-300 bg-white" placeholder="e.g. 7M3X9K2P1Q">
                </label>
                <span id="err-trx-nagad" class="mt-1 hidden text-xs font-bold text-error" data-bn="TrxID দিন">Enter your Nagad TrxID</span>
              </div>
              <label class="flex cursor-not-allowed items-start gap-3 rounded-2xl border border-base-300 bg-base-200/40 p-4 opacity-60">
                <input type="radio" name="payment" value="card" class="radio radio-sm mt-0.5" disabled>
                <span>
                  <span class="flex flex-wrap items-center gap-2 text-sm font-bold text-navy-900">Card / SSLCommerz <span class="rounded-full bg-navy-950 px-2.5 py-0.5 text-[10px] font-extrabold text-gold-300" data-bn="শীঘ্রই আসছে">Coming soon</span></span>
                  <span class="mt-0.5 block text-xs text-base-content/60" data-bn="ভিসা/মাস্টারকার্ড পেমেন্ট শীঘ্রই চালু হবে।">Visa / Mastercard payment is being set up.</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <aside class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm lg:sticky lg:top-24">
          <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="অর্ডার সামারি">Order Summary</h2>
          <div id="co-items" class="mt-4 space-y-3"></div>
          <div class="mt-4 flex items-center justify-between border-t border-base-300 pt-4 font-bold text-navy-900">
            <span data-bn="সাবটোটাল">Subtotal</span>
            <span id="co-subtotal" class="font-display text-base">৳0</span>
          </div>
          <p class="mt-2 text-[11px] leading-relaxed text-base-content/55" data-bn="ডেলিভারি চার্জ ডিসপ্যাচের আগে হোয়াটসঅ্যাপে কনফার্ম করা হবে।">Delivery charge is confirmed on WhatsApp before dispatch.</p>
          <button type="submit" class="btn btn-gold mt-5 w-full font-extrabold">
            <svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে অর্ডার করুন">Place Order via WhatsApp</span>
          </button>
          <p class="mt-3 text-center text-[11px] text-base-content/50">By ordering you agree to our <a href="terms.html" class="font-bold text-gold-700 underline underline-offset-2">terms</a> and <a href="refund-exchange.html" class="font-bold text-gold-700 underline underline-offset-2">refund policy</a>.</p>
        </aside>
      </form>

      <div id="checkout-success" class="mx-auto hidden max-w-xl rounded-3xl border border-gold-400/40 bg-base-100 p-8 text-center shadow-lg">
        <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success"><svg class="size-7"><use href="#i-check"/></svg></span>
        <h2 class="mt-4 font-display text-2xl font-semibold text-navy-900" data-bn="অর্ডার পাঠানো হয়েছে!">Order sent!</h2>
        <p class="mt-2 text-sm leading-relaxed text-base-content/70" data-bn="হোয়াটসঅ্যাপে আপনার অর্ডারের মেসেজ খুলে গেছে — সেখানে Send চাপলেই আমরা ডেলিভারি কনফার্ম করব।">WhatsApp should have opened with your order — press <b>Send</b> there and we'll confirm your delivery.</p>
        <div id="co-success-summary" class="mt-4 rounded-2xl bg-base-200/60 p-4 text-left text-sm font-semibold whitespace-pre-line text-navy-900"></div>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <a id="co-wa-again" href="#" target="_blank" rel="noopener" class="btn border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="আবার হোয়াটসঅ্যাপ খুলুন">Open WhatsApp again</span></a>
          <a href="shop.html" class="btn btn-outline font-bold" data-bn="শপে ফিরে যান">Back to shop</a>
        </div>
      </div>
    </section>
` + shellBottom("");

/* ---------------- offers page ---------------- */

const offersSorted = () => products.slice().sort((a, b) => (1 - b.price / b.oldPrice) - (1 - a.price / a.oldPrice));

const offersPage = () => shellTop("offers", {
  title: `Offers & Deals — Up to ${Math.max(...products.map((p) => discount(p)))}% Off Office Chairs | Golden Chair King`,
  desc: "Limited-time chair offers at Golden Chair King — real discounts on office chairs in Dhaka with extra 5% off on advance bKash/Nagad payment. Nationwide delivery.",
  canonical: SITE.domain + "/offers.html",
}) + `
    <section class="relative overflow-hidden bg-[#02101f]">
      <div class="pointer-events-none absolute -top-24 right-[-5%] size-[360px] rounded-full bg-gold-500/12 blur-[110px]" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -bottom-32 left-[-10%] size-[420px] rounded-full bg-navy-700/40 blur-[130px]" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(233,199,134,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(70%_60%_at_55%_30%,black,transparent)]" aria-hidden="true"></div>

      <div class="container-x relative pt-10 sm:pt-14">
${crumbNav([["Home", "index.html"], ["Offers", null]])}
        <p class="hero-anim d1 eyebrow" data-bn="অফার">Offers</p>
        <h1 class="hero-anim d2 mt-2 font-display text-[26px] font-semibold text-white sm:text-4xl" data-bn="অফার ও ডিল">Offers &amp; Deals</h1>
        <p class="hero-anim d3 mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">Limited-time prices on office chairs — extra 5% off when you pay in advance via bKash or Nagad.</p>
      </div>

      <div class="container-x relative pt-8 pb-12 sm:pt-10 sm:pb-16">
        <div class="hero-anim d4 overflow-hidden rounded-[28px] border border-gold-400/15 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-6 sm:p-10">
          <div class="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]">
            <div>
              <span class="badge border-0 bg-gold-400 font-extrabold text-navy-950" data-bn="সীমিত সময়ের অফার">Limited-Time Offer</span>
              <h2 class="mt-4 font-display text-2xl leading-tight font-semibold text-white sm:text-3xl lg:text-4xl">
                <span data-bn="সব চেয়ারে — সর্বোচ্চ">Save up to</span>
                <span class="gold-text" data-bn="${bnNum(Math.max(...products.map((p) => discount(p))))}% ছাড়">${Math.max(...products.map((p) => discount(p)))}% OFF</span>
              </h2>
              <p class="mt-3 max-w-md text-sm leading-relaxed text-white/65" data-bn="অফার আজ রাত ১২টায় শেষ — টাইমার শেষ হওয়ার আগেই আপনার চেয়ার বুক করুন।">Offer ends tonight at 12 AM — reserve your chair before the timer runs out.</p>
              <div class="mt-6 flex items-center gap-2 sm:gap-3" data-countdown aria-label="Offer countdown">
            <div class="cd-box"><span class="cd-v" data-cd="h">00</span><span class="cd-l" data-bn="ঘণ্টা">Hours</span></div>
            <span class="font-display text-xl font-bold text-gold-400" aria-hidden="true">:</span>
            <div class="cd-box"><span class="cd-v" data-cd="m">00</span><span class="cd-l" data-bn="মিনিট">Minutes</span></div>
            <span class="font-display text-xl font-bold text-gold-400" aria-hidden="true">:</span>
            <div class="cd-box"><span class="cd-v" data-cd="s">00</span><span class="cd-l" data-bn="সেকেন্ড">Seconds</span></div>
          </div>
          <div class="mt-7 flex flex-wrap gap-3">
            <a href="https://wa.me/${SITE.wa}?text=Assalamu%20Alaikum!%20I%20want%20to%20know%20about%20today's%20chair%20offers." target="_blank" rel="noopener" class="btn border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে জিজ্ঞাসা করুন">Ask on WhatsApp</span></a>
            <a href="tel:${SITE.phone}" class="btn border-white/25 bg-transparent font-bold text-white hover:border-white hover:bg-white/10"><svg class="size-4.5"><use href="#i-phone"/></svg><span>${SITE.phoneDisplay}</span></a>
          </div>
        </div>
            <div class="relative mx-auto w-full max-w-[280px]">
              <div class="pointer-events-none absolute -inset-6 rounded-[36px] bg-gold-500/10 blur-2xl" aria-hidden="true"></div>
              <img src="assets/img/banner-gck-navy.webp" alt="Golden Chair King — অর্ডার করতে ইনবক্স করুন বা কল করুন" loading="lazy" class="relative w-full rounded-3xl border border-gold-400/30 shadow-[0_0_0_1px_rgba(233,199,134,0.14),0_28px_60px_-20px_rgba(0,0,0,0.65)]">
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container-x py-10 sm:py-14">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="eyebrow" data-bn="সব অফার">All Offers</p>
          <h2 class="section-title title-underline mt-1.5" data-bn="অফারে থাকা চেয়ার">Chairs on Offer</h2>
        </div>
      </div>
      <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-stagger>
${offersSorted().map((p) => productCard(p)).join("\n\n")}
      </div>
    </section>
` + shellBottom("shop");

/* ---------------- about page ---------------- */

const aboutPage = () => shellTop("about", {
  title: `About ${SITE.name} — Office Chair Shop in Jatrabari, Dhaka`,
  desc: `The story of ${SITE.name}: a trusted office chair shop in South Jatrabari, Dhaka — boss chairs, wooden chairs and ergonomic seating at honest prices since day one.`,
  canonical: SITE.domain + "/about.html",
}) + `
${pageHero({
  eyebrow: "Our Story",
  eyebrowBn: "আমাদের গল্প",
  title: "The Chair Specialists of Dhaka",
  titleBn: "ঢাকার চেয়ার স্পেশালিস্ট",
  sub: "From a small showroom in South Jatrabari, we have become one of Dhaka's most trusted names for office seating.",
  crumbs: [["Home", "index.html"], ["About", null]],
})}
    <section class="container-x py-12 sm:py-16">
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div data-reveal class="reveal-left">
          <h2 class="section-title title-underline" data-bn="কে আমরা">Who we are</h2>
          <p class="mt-5 text-sm leading-relaxed text-base-content/70 sm:text-[15px]">${SITE.name} is an office chair shop in <b>South Jatrabari, Dhaka</b>. We keep it simple: honest chairs, honest prices, and service that continues long after delivery.</p>
          <p class="mt-4 text-sm leading-relaxed text-base-content/70 sm:text-[15px]">Our range covers everything a workspace needs — commanding leather boss chairs, traditional wooden boss chairs, high-back ergonomic mesh chairs and dependable staff seating. Every chair is checked before it leaves the showroom, and every customer gets our number on WhatsApp for after-sales support.</p>
          <p class="mt-4 text-sm leading-relaxed text-base-content/70 sm:text-[15px]">Corporate and bulk orders? We regularly supply offices, startups and government offices across Bangladesh — talk to us for special pricing.</p>
        </div>
        <div data-reveal class="reveal-right">
          <img src="assets/img/banner-gck-crown.webp" alt="${SITE.name} — the golden crown of office chairs" width="1400" height="933" loading="lazy" class="img-fade w-full rounded-3xl border border-gold-400/30 shadow-[0_0_0_1px_rgba(233,199,134,0.14),0_28px_60px_-20px_rgba(0,0,0,0.4)]">
        </div>
      </div>
    </section>

    <section class="bg-base-200/50 py-12 sm:py-16">
      <div class="container-x">
        <div class="text-center" data-reveal>
          <p class="eyebrow" data-bn="শোরুম ও গুদাম">Showroom &amp; warehouse</p>
          <h2 class="section-title title-underline title-underline-center mt-1.5" data-bn="ভেতর থেকে এক ঝলক">A look inside</h2>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <img src="assets/img/scenes/showroom.webp" alt="${SITE.name} showroom — chairs ready for delivery" loading="lazy" class="img-fade h-56 w-full rounded-3xl border border-base-300 object-cover shadow-sm sm:h-64">
          <img src="assets/img/scenes/warehouse.webp" alt="${SITE.name} warehouse — chairs in stock" loading="lazy" class="img-fade h-56 w-full rounded-3xl border border-base-300 object-cover shadow-sm sm:h-64">
          <img src="assets/img/scenes/office-room.webp" alt="A ${SITE.name} chair in a Dhaka office" loading="lazy" class="img-fade h-56 w-full rounded-3xl border border-base-300 object-cover shadow-sm sm:h-64">
        </div>
      </div>
    </section>

    <section class="bg-base-100 py-12 sm:py-16">
      <div class="container-x">
        <div class="text-center" data-reveal>
          <p class="eyebrow" data-bn="আমাদের প্রতিশ্রুতি">Our promise</p>
          <h2 class="section-title title-underline title-underline-center mt-1.5" data-bn="কেন আমাদের উপর ভরসা রাখেন">Why people trust us</h2>
        </div>
        <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-stagger>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-shield"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="অথেনটিক ওয়ারেন্টি">Genuine Warranty</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="নির্বাচিত পণ্যে ১ বছর পর্যন্ত রিপ্লেসমেন্ট ওয়ারেন্টি।">Up to 1-year replacement warranty on selected items.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-truck"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="সারা দেশে ডেলিভারি">Nationwide Delivery</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="৬৪ জেলায় দ্রুত ও যত্নসহ ডেলিভারি।">Fast &amp; careful delivery to all 64 districts.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-rotate"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="৭ দিনের সহজ এক্সচেঞ্জ">7-Day Easy Exchange</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="পছন্দ হয়নি? ৭ দিনের মধ্যে ঝামেলাহীন এক্সচেঞ্জ।">Not satisfied? Exchange within 7 days, hassle-free.</p>
          </div>
          <div class="group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-lg sm:p-5" data-reveal>
            <span class="flex size-11 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all duration-300 group-hover:scale-110 group-hover:border-gold-500 group-hover:bg-navy-950 group-hover:text-gold-300"><svg class="size-5.5"><use href="#i-tag"/></svg></span>
            <h3 class="mt-3.5 text-[15px] font-bold text-navy-900" data-bn="সেরা দামের গ্যারান্টি">Best Price Guarantee</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-base-content/60" data-bn="সরাসরি শোরুমের দাম — কোনো মধ্যস্বত্বভোগী নেই।">Direct showroom prices — no middlemen.</p>
          </div>
        </div>
        <div class="mt-10 text-center" data-reveal>
          <a href="contact.html" class="btn btn-gold font-extrabold"><span data-bn="শোরুমে আসুন">Visit our showroom</span><svg class="size-4.5"><use href="#i-arrow"/></svg></a>
        </div>
      </div>
    </section>
` + shellBottom("about");

/* ---------------- contact page ---------------- */

const contactPage = () => shellTop("contact", {
  title: `Contact ${SITE.name} — South Jatrabari, Dhaka | Call, WhatsApp, Email`,
  desc: `Visit our showroom in South Jatrabari, Dhaka, call ${SITE.phoneDisplay} or message ${SITE.name} on WhatsApp. Open every day 10 AM – 9 PM.`,
  canonical: SITE.domain + "/contact.html",
  jsonLd: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact " + SITE.name,
    url: SITE.domain + "/contact.html",
  }),
}) + `
${pageHero({
  eyebrow: "Contact",
  eyebrowBn: "যোগাযোগ",
  title: "Talk to Us",
  titleBn: "আমাদের সাথে কথা বলুন",
  sub: "Call, WhatsApp or drop by the showroom — we reply fast and answer honestly.",
  crumbs: [["Home", "index.html"], ["Contact", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div class="space-y-4">
          <a href="tel:${SITE.phone}" class="group flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-lg">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all group-hover:bg-navy-950 group-hover:text-gold-300 sm:size-12"><svg class="size-5"><use href="#i-phone"/></svg></span>
            <span>
              <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="কল করুন">Call us</span>
              <span class="block text-sm font-bold text-navy-900">${SITE.phoneDisplay}</span>
            </span>
          </a>
          <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="group flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-lg">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all group-hover:bg-navy-950 group-hover:text-gold-300 sm:size-12"><svg class="size-5"><use href="#i-wa"/></svg></span>
            <span>
              <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase">WhatsApp</span>
              <span class="block text-sm font-bold text-navy-900">${SITE.phoneDisplay}</span>
            </span>
          </a>
          <a href="mailto:${SITE.email}" class="group flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:shadow-lg">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 transition-all group-hover:bg-navy-950 group-hover:text-gold-300 sm:size-12"><svg class="size-5"><use href="#i-mail"/></svg></span>
            <span>
              <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="ইমেইল">Email</span>
              <span class="block text-sm font-bold text-navy-900">${SITE.email}</span>
            </span>
          </a>
          <div class="group flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 sm:size-12"><svg class="size-5"><use href="#i-pin"/></svg></span>
            <span>
              <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="শোরুম">Showroom</span>
              <span class="block text-sm font-bold text-navy-900">${SITE.address}, Bangladesh</span>
            </span>
          </div>
          <div class="group flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <span class="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-white text-gold-600 sm:size-12"><svg class="size-5"><use href="#i-clock"/></svg></span>
            <span>
              <span class="block text-xs font-extrabold tracking-wide text-base-content/45 uppercase" data-bn="খোলার সময়">Open hours</span>
              <span class="block text-sm font-bold text-navy-900" data-bn="${SITE.hoursBn}">${SITE.hours}</span>
            </span>
          </div>
        </div>

        <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
          <h2 class="font-display text-xl font-semibold text-navy-900" data-bn="মেসেজ পাঠান">Send us a message</h2>
          <p class="mt-2 text-sm text-base-content/60" data-bn="ফর্ম পূরণ করে পাঠান — মেসেজ হোয়াটসঅ্যাপে খুলবে।">Fill the form — the message opens in WhatsApp so you can send it instantly.</p>
          <form id="contact-form" novalidate class="mt-5 space-y-4">
            <label class="block">
              <span class="text-xs font-bold text-base-content/60" data-bn="নাম *">Your name *</span>
              <input id="ct-name" type="text" class="input mt-1 w-full border-base-300 bg-white" placeholder="Your name">
              <span id="err-ct-name" class="mt-1 hidden text-xs font-bold text-error" data-bn="নাম লিখুন">Please enter your name</span>
            </label>
            <label class="block">
              <span class="text-xs font-bold text-base-content/60" data-bn="মোবাইল নম্বর">Mobile number</span>
              <input id="ct-phone" type="tel" class="input mt-1 w-full border-base-300 bg-white" placeholder="01XXXXXXXXX">
            </label>
            <label class="block">
              <span class="text-xs font-bold text-base-content/60" data-bn="মেসেজ *">Message *</span>
              <textarea id="ct-msg" rows="4" class="textarea mt-1 w-full border-base-300 bg-white" placeholder="Tell us what you're looking for…"></textarea>
              <span id="err-ct-msg" class="mt-1 hidden text-xs font-bold text-error" data-bn="মেসেজ লিখুন">Please write a short message</span>
            </label>
            <button type="submit" class="btn btn-gold w-full font-extrabold"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে পাঠান">Send via WhatsApp</span></button>
            <p class="text-center text-[11px] text-base-content/50" data-bn="অথবা সরাসরি ইমেইল:">or email us directly at <a href="mailto:${SITE.email}" class="font-bold text-gold-700 underline underline-offset-2">${SITE.email}</a></p>
          </form>
        </div>
      </div>

      <div class="mt-10">
        <iframe src="https://www.google.com/maps?q=South+Jatrabari,+Dhaka,+Bangladesh&amp;output=embed" class="h-80 w-full rounded-3xl border border-base-300 shadow-sm" loading="lazy" title="Map — ${SITE.name} showroom, South Jatrabari, Dhaka" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </section>
` + shellBottom("contact");

/* ---------------- FAQ page ---------------- */

const faqs = [
  {
    q: "How do I place an order?",
    a: "Add a chair to your cart and place the order through checkout — your order opens in WhatsApp and we confirm price, delivery charge and stock right away. You can also message us directly on WhatsApp or call " + SITE.phoneDisplay + ".",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery anywhere in Bangladesh, plus bKash and Nagad. During offers, paying in advance via bKash or Nagad gets you an extra 5% off. Card payment (SSLCommerz) is coming soon.",
  },
  {
    q: "How long does delivery take?",
    a: "Inside Dhaka usually 24–48 hours after confirmation; outside Dhaka 2–4 days by district. We dispatch only after the order is confirmed with you.",
  },
  {
    q: "What is the delivery charge?",
    a: "Indicative rates: inside Dhaka ৳200–500 depending on area, outside Dhaka ৳500–1,200 by district. The exact charge is confirmed on WhatsApp before dispatch — no surprises.",
  },
  {
    q: "Do the chairs come with a warranty?",
    a: "Selected models carry up to a 1-year replacement warranty covering structural and manufacturing issues. Ask us on WhatsApp about the specific model before ordering.",
  },
  {
    q: "Can I exchange a chair after buying?",
    a: "Yes — unused chairs in original condition can be exchanged within 7 days. If the chair arrives damaged or wrong, we cover the transport and make it right. See our Refund & Exchange policy.",
  },
  {
    q: "Do you deliver outside Dhaka?",
    a: "Yes, we deliver to all 64 districts of Bangladesh.",
  },
  {
    q: "Do you take bulk or corporate orders?",
    a: "Yes — offices, startups and government offices order from us regularly. Message us for special bulk pricing and invoicing.",
  },
];

const faqLd = () => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const faqPage = () => shellTop("shop", {
  title: "FAQ — Ordering, Delivery, Payment & Warranty | Golden Chair King",
  desc: "Answers about ordering, payment (COD, bKash, Nagad), delivery across Bangladesh, warranty and exchanges at Golden Chair King.",
  canonical: SITE.domain + "/faq.html",
  jsonLd: faqLd(),
}) + `
${pageHero({
  eyebrow: "FAQ",
  eyebrowBn: "সাধারণ প্রশ্ন",
  title: "Frequently Asked Questions",
  titleBn: "সাধারণ জিজ্ঞাসা",
  sub: "Everything about ordering, delivery, payment and warranty — still stuck? WhatsApp us.",
  crumbs: [["Home", "index.html"], ["FAQ", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="mx-auto max-w-3xl space-y-3">
${faqs.map((f) => `        <details class="group overflow-hidden rounded-2xl border border-base-300 bg-base-100">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-navy-900 sm:text-[15px]">
            <span>${f.q}</span>
            <svg class="size-4 shrink-0 text-gold-600 transition-transform group-open:rotate-180"><use href="#i-chevron"/></svg>
          </summary>
          <p class="border-t border-base-300 px-5 py-4 text-sm leading-relaxed text-base-content/70">${f.a}</p>
        </details>`).join("\n")}
      </div>
      <div class="mx-auto mt-10 max-w-3xl rounded-3xl border border-gold-400/40 bg-gold-100/40 p-6 text-center">
        <p class="font-display text-lg font-semibold text-navy-900" data-bn="উত্তর পাননি?">Didn't find your answer?</p>
        <a href="https://wa.me/${SITE.wa}?text=Assalamu%20Alaikum!%20I%20have%20a%20question." target="_blank" rel="noopener" class="btn mt-4 border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে জিজ্ঞাসা করুন">Ask on WhatsApp</span></a>
      </div>
    </section>
` + shellBottom("shop");

/* ---------------- order tracking page ---------------- */

const orderTrackingPage = () => shellTop("shop", {
  title: "Track Your Order — Golden Chair King",
  desc: "Check your Golden Chair King order status — enter your phone number or order reference and get a live update on WhatsApp.",
  canonical: SITE.domain + "/order-tracking.html",
  robots: "noindex, follow",
}) + `
${pageHero({
  eyebrow: "Order Tracking",
  eyebrowBn: "অর্ডার ট্র্যাকিং",
  title: "Track Your Order",
  titleBn: "অর্ডার ট্র্যাক করুন",
  sub: "Enter the phone number or reference you gave us when ordering.",
  crumbs: [["Home", "index.html"], ["Track Order", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="mx-auto max-w-2xl">
        <form id="track-form" class="flex flex-col gap-3 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:flex-row">
          <input id="track-input" type="text" class="input flex-1 border-base-300 bg-white" placeholder="01XXXXXXXXX or order reference" aria-label="Phone number or order reference">
          <button type="submit" class="btn btn-gold font-extrabold"><span data-bn="স্ট্যাটাস দেখুন">Check status</span></button>
        </form>

        <div id="track-result" class="mt-8 hidden rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
          <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="আপনার অর্ডার যেভাবে এগোয়">How your order moves</h2>
          <ol class="mt-5 space-y-4">
            <li class="flex gap-4">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 font-display text-sm font-bold text-gold-700">1</span>
              <span><b class="text-sm text-navy-900" data-bn="অর্ডার প্লেসড">Order placed</b><span class="mt-0.5 block text-xs text-base-content/60" data-bn="কনফার্মেশনের অপেক্ষায়।">Waiting for confirmation.</span></span>
            </li>
            <li class="flex gap-4">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 font-display text-sm font-bold text-gold-700">2</span>
              <span><b class="text-sm text-navy-900" data-bn="হোয়াটসঅ্যাপে কনফার্ম">Confirmed on WhatsApp</b><span class="mt-0.5 block text-xs text-base-content/60" data-bn="দাম, ডেলিভারি চার্জ ও স্টক কনফার্ম।">Price, delivery charge &amp; stock confirmed.</span></span>
            </li>
            <li class="flex gap-4">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-100 font-display text-sm font-bold text-gold-700">3</span>
              <span><b class="text-sm text-navy-900" data-bn="চেয়ার প্যাক ও ডিসপ্যাচ">Packed &amp; dispatched</b><span class="mt-0.5 block text-xs text-base-content/60" data-bn="ডেলিভারির পথে।">On the way to you.</span></span>
            </li>
            <li class="flex gap-4">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 font-display text-sm font-bold text-success">✓</span>
              <span><b class="text-sm text-navy-900" data-bn="ডেলিভারি সম্পন্ন">Delivered</b><span class="mt-0.5 block text-xs text-base-content/60" data-bn="পেমেন্ট ও ওয়ারেন্টি কার্ডসহ।">With payment receipt &amp; warranty card.</span></span>
            </li>
          </ol>
          <div class="mt-6 rounded-2xl bg-base-200/60 p-4 text-[13px] leading-relaxed text-base-content/70" data-bn="লাইভ স্ট্যাটাস জানতে নিচের বাটনে ক্লিক করুন — আপনার নম্বরসহ মেসেজ রেডি থাকবে।">For a live status, tap below — the message is pre-filled with your number, just press send.</div>
          <a id="track-wa" href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="btn mt-4 w-full border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span data-bn="হোয়াটসঅ্যাপে স্ট্যাটাস নিন">Get live status on WhatsApp</span></a>
        </div>

        <div class="mt-8 rounded-3xl border border-base-300 bg-base-100 p-6 text-sm leading-relaxed text-base-content/70 shadow-sm">
          <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="কথা বলতে চান?">Prefer to talk?</h2>
          <p class="mt-2" data-bn="সকাল ১০টা – রাত ৯টা প্রতিদিন কল বা হোয়াটসঅ্যাপ করুন।">Call or WhatsApp us every day between 10 AM and 9 PM — we'll check your order instantly.</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a href="tel:${SITE.phone}" class="btn btn-primary font-bold"><svg class="size-4.5"><use href="#i-phone"/></svg><span>${SITE.phoneDisplay}</span></a>
            <a href="faq.html" class="btn btn-outline font-bold" data-bn="সাধারণ প্রশ্ন">FAQ</a>
          </div>
        </div>
      </div>
    </section>
` + shellBottom("shop");

/* ---------------- delivery page ---------------- */

const deliveryPage = () => shellTop("shop", {
  title: "Delivery & Shipping — Nationwide Chair Delivery | Golden Chair King",
  desc: "Delivery & shipping at Golden Chair King: inside Dhaka in 24–48 hours, all 64 districts in 2–4 days. Cash on delivery, bKash & Nagad accepted.",
  canonical: SITE.domain + "/delivery.html",
}) + `
${pageHero({
  eyebrow: "Delivery & Shipping",
  eyebrowBn: "ডেলিভারি ও শিপিং",
  title: "Delivery & Shipping",
  titleBn: "ডেলিভারি ও শিপিং",
  sub: "Careful packing, honest charges and a confirmation call before every dispatch.",
  crumbs: [["Home", "index.html"], ["Delivery", null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div class="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
          <div class="border-b border-base-300 px-6 py-5">
            <h2 class="font-display text-lg font-semibold text-navy-900" data-bn="ডেলিভারি রেট">Delivery rates &amp; time</h2>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-base-300 bg-base-200/50 text-left text-xs font-extrabold tracking-wide text-base-content/50 uppercase">
                <th class="px-6 py-3">Area</th>
                <th class="px-6 py-3">Time</th>
                <th class="px-6 py-3">Charge (indicative)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-base-200"><td class="px-6 py-3.5 font-bold text-navy-900">Inside Dhaka city</td><td class="px-6 py-3.5 text-base-content/70">24–48 hours</td><td class="px-6 py-3.5 font-semibold text-navy-900">৳200–500</td></tr>
              <tr class="border-b border-base-200"><td class="px-6 py-3.5 font-bold text-navy-900">Dhaka suburbs</td><td class="px-6 py-3.5 text-base-content/70">1–2 days</td><td class="px-6 py-3.5 font-semibold text-navy-900">৳300–600</td></tr>
              <tr class="border-b border-base-200"><td class="px-6 py-3.5 font-bold text-navy-900">Outside Dhaka (64 districts)</td><td class="px-6 py-3.5 text-base-content/70">2–4 days</td><td class="px-6 py-3.5 font-semibold text-navy-900">৳500–1,200</td></tr>
              <tr><td class="px-6 py-3.5 font-bold text-navy-900">Bulk / corporate</td><td class="px-6 py-3.5 text-base-content/70">Scheduled</td><td class="px-6 py-3.5 font-semibold text-navy-900">Custom quote</td></tr>
            </tbody>
          </table>
          <p class="border-t border-base-300 bg-base-200/40 px-6 py-4 text-[12px] leading-relaxed text-base-content/60" data-bn="চূড়ান্ত চার্জ ডিসপ্যাচের আগে হোয়াটসঅ্যাপে কনফার্ম করা হয়।">Exact charge depends on your area and item weight — always confirmed on WhatsApp before dispatch.</p>
        </div>

        <div class="space-y-4">
          <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <h3 class="flex items-center gap-2.5 font-display text-base font-semibold text-navy-900"><svg class="size-5 text-gold-600"><use href="#i-truck"/></svg><span data-bn="যেভাবে ডেলিভারি হয়">How delivery works</span></h3>
            <ol class="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-base-content/70">
              <li>You place the order — we confirm price, stock and delivery charge on WhatsApp.</li>
              <li>Chairs are checked, foam-wrapped and boxed (see our packing photos).</li>
              <li>Courier or our own van delivers to your door; you inspect before paying.</li>
            </ol>
          </div>
          <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
            <h3 class="flex items-center gap-2.5 font-display text-base font-semibold text-navy-900"><svg class="size-5 text-gold-600"><use href="#i-shield"/></svg><span data-bn="পেমেন্ট">Payment</span></h3>
            <ul class="mt-4 space-y-2 text-[13px] leading-relaxed text-base-content/70">
              <li>• Cash on Delivery — inspect the chair, then pay.</li>
              <li>• bKash / Nagad advance — extra 5% off during offers.</li>
              <li>• Card payment (SSLCommerz) — coming soon.</li>
            </ul>
          </div>
          <div class="rounded-3xl border border-gold-400/40 bg-gold-100/40 p-6">
            <h3 class="font-display text-base font-semibold text-navy-900" data-bn="পণ্য নষ্ট হলে?">Damaged on arrival?</h3>
            <p class="mt-2 text-[13px] leading-relaxed text-base-content/70" data-bn="ডেলিভারির সময়ই দেখে নিন; সমস্যা থাকলে ২৪ ঘণ্টার মধ্যে ছবিসহ জানান — বিনা খরচে বদলে দেওয়া হবে।">Inspect at delivery and report any damage within 24 hours with photos — we replace it free of charge.</p>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <p class="text-sm font-bold text-navy-900" data-bn="ডেলিভারি নিয়ে প্রশ্ন আছে?">Questions about delivery? Call or message us.</p>
        <div class="flex flex-wrap gap-3">
          <a href="tel:${SITE.phone}" class="btn btn-primary font-bold"><svg class="size-4.5"><use href="#i-phone"/></svg><span>Call now</span></a>
          <a href="https://wa.me/${SITE.wa}" target="_blank" rel="noopener" class="btn border-0 bg-[#25D366] font-bold text-white hover:bg-[#1fba57]"><svg class="size-4.5"><use href="#i-wa"/></svg><span>WhatsApp</span></a>
        </div>
      </div>
    </section>
` + shellBottom("shop");

/* ---------------- policy pages ---------------- */

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    titleBn: "গোপনীয়তা নীতি",
    eyebrow: "Legal",
    eyebrowBn: "লিগ্যাল",
    intro: "This policy explains what information " + SITE.name + " collects when you use this website or order from us, and how we handle it.",
    sections: [
      ["What we collect", ["Your name, phone number, email (optional) and delivery address when you place an order.", "Order details — the chairs you chose, quantities and amounts.", "Payment references such as the bKash/Nagad TrxID when you pay in advance."]],
      ["How we use it", ["To process, confirm and deliver your order — usually over WhatsApp or phone.", "For after-sales support, warranty and exchange handling.", "We never sell or rent your personal information to anyone."]],
      ["Who we share it with", ["Delivery partners (courier services and drivers) — only the address and phone needed to deliver.", "Payment providers, only when required to verify a payment.", "Nobody else, unless the law requires it."]],
      ["Cookies & storage", ["Your cart is stored in your own browser (localStorage) — it never leaves your device until you place an order.", "We don't run advertising trackers on this website."]],
      ["Retention & your rights", ["Order records are kept for warranty and accounting purposes.", "You can ask us to correct or delete your contact details anytime — just message us."]],
      ["Contact", ["Questions about this policy? Email " + SITE.email + " or WhatsApp " + SITE.phoneDisplay + "."]],
    ],
  },
  terms: {
    title: "Terms of Service",
    titleBn: "শর্তাবলী",
    eyebrow: "Legal",
    eyebrowBn: "লিগ্যাল",
    intro: "These are the terms for buying from " + SITE.name + " — through this website, over WhatsApp or at our showroom.",
    sections: [
      ["Orders & confirmation", ["Every order is confirmed by our team on WhatsApp or phone before dispatch.", "If an item is out of stock or mispriced, we may cancel the order — any advance payment is returned in full."]],
      ["Prices", ["All prices are in Bangladeshi Taka (৳) and may change without notice.", "\"Offer\" prices are limited-time and cannot be combined unless we say so."]],
      ["Delivery", ["Estimated times (Dhaka 24–48 hours, nationwide 2–4 days) are not guarantees — weather and logistics can add delays.", "Exact delivery charges are confirmed on WhatsApp before dispatch."]],
      ["Warranty & exchange", ["Selected chairs carry up to a 1-year replacement warranty; exchanges follow our Refund & Exchange policy.", "Report transit damage within 24 hours of delivery."]],
      ["Liability", ["Please inspect your chair at delivery. Our liability is limited to repair, replacement or refund of the item purchased."]],
      ["Changes", ["We may update these terms from time to time; the current version always lives on this page."]],
    ],
  },
  refund: {
    title: "Refund & Exchange Policy",
    titleBn: "রিফান্ড ও এক্সচেঞ্জ নীতি",
    eyebrow: "Legal",
    eyebrowBn: "লিগ্যাল",
    intro: "We want you to be confident buying from " + SITE.name + ". Here's exactly how exchanges, warranty and refunds work.",
    sections: [
      ["7-day easy exchange", ["Unused chairs in original condition and packaging can be exchanged within 7 days of delivery.", "Change of mind: you bear the transport cost for sending the chair back.", "Damaged or wrong item: we cover transport and make it right — report within 24 hours of delivery."]],
      ["Warranty claims", ["Selected models carry up to a 1-year replacement warranty on structure and manufacturing.", "Normal wear, misuse, water/heat damage and self-repair are not covered.", "Start a claim on WhatsApp with your order reference and clear photos."]],
      ["Refunds for advance payments", ["If we cancel an order (out of stock, etc.), advance payments are returned via bKash/Nagad within 3–5 working days."]],
      ["Not eligible", ["Custom-made, custom-colour or bulk corporate orders are not returnable unless defective."]],
      ["How to start", ["WhatsApp " + SITE.phoneDisplay + " with your order details — we'll guide you through in minutes."]],
    ],
  },
};

const policyPage = (kind) => {
  const c = policyContent[kind];
  const slug = kind === "privacy" ? "privacy-policy.html" : kind === "terms" ? "terms.html" : "refund-exchange.html";
  return shellTop("", {
    title: c.title + " — " + SITE.name,
    desc: c.intro.slice(0, 158),
    canonical: SITE.domain + "/" + slug,
  }) + `
${pageHero({
  eyebrow: c.eyebrow,
  eyebrowBn: c.eyebrowBn,
  title: c.title,
  titleBn: c.titleBn,
  sub: c.intro,
  crumbs: [["Home", "index.html"], [c.title, null]],
})}
    <section class="container-x py-10 sm:py-14">
      <div class="mx-auto max-w-3xl space-y-8">
${c.sections.map(([h, bullets]) => `        <div class="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8">
          <h2 class="font-display text-lg font-semibold text-navy-900">${h}</h2>
          <ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-base-content/70">
${bullets.map((b) => `            <li>${b}</li>`).join("\n")}
          </ul>
        </div>`).join("\n\n")}
        <p class="text-center text-xs text-base-content/45">Last updated: November 2026 · ${SITE.name}, ${SITE.address}, Bangladesh</p>
      </div>
    </section>
` + shellBottom("");
};

/* ---------------- 404 ---------------- */

const notFoundPage = () => shellTop("", {
  title: "Page not found — " + SITE.name,
  desc: "This page doesn't exist — browse our office chairs instead.",
  canonical: SITE.domain + "/404.html",
  robots: "noindex, follow",
}) + `
    <section class="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p class="gold-text font-display text-6xl font-bold sm:text-7xl">404</p>
      <h1 class="mt-4 font-display text-2xl font-semibold text-navy-900" data-bn="পেজটি পাওয়া যায়নি">This page doesn't exist</h1>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-base-content/60" data-bn="লিংকটি পুরনো বা ভুল হতে পারে — চেয়ারগুলো কিন্তু সব এখানেই আছে।">The link may be old or mistyped — the chairs are all still here.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a href="index.html" class="btn btn-gold font-extrabold"><span data-bn="হোমে যান">Back to Home</span></a>
        <a href="shop.html" class="btn btn-outline font-bold"><span data-bn="চেয়ার দেখুন">Shop Chairs</span></a>
      </div>
    </section>
` + shellBottom("");

/* ---------------- write files ---------------- */

const pages = [
  ["index.html", homePage()],
  ["shop.html", shopPage()],
  ["cart.html", cartPage()],
  ["checkout.html", checkoutPage()],
  ["offers.html", offersPage()],
  ["about.html", aboutPage()],
  ["contact.html", contactPage()],
  ["faq.html", faqPage()],
  ["order-tracking.html", orderTrackingPage()],
  ["delivery.html", deliveryPage()],
  ["privacy-policy.html", policyPage("privacy")],
  ["terms.html", policyPage("terms")],
  ["refund-exchange.html", policyPage("refund")],
  ["404.html", notFoundPage()],
];
// product pages live one level deep (product/…) — prefix every relative URL
const rel = (html) => html.replace(/(href|src|action|data-src)="(?!https?:|#|mailto:|tel:|data:)([^"]*)"/g, '$1="../$2"');

for (const p of products) pages.push([`product/${p.slug}.html`, rel(productPage(p))]);

for (const [file, html] of pages) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`${file} written`);
}

writeFileSync("assets/js/products.js", `// Generated from scripts/data/products.mjs — do not edit by hand.\nwindow.GCK_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`);
console.log("assets/js/products.js written");

/* sitemap */
const sitemapUrls = [
  ["", "1.0", "daily"],
  ["shop.html", "0.9", "daily"],
  ["offers.html", "0.8", "daily"],
  ["about.html", "0.6", "monthly"],
  ["contact.html", "0.6", "monthly"],
  ["faq.html", "0.6", "monthly"],
  ["delivery.html", "0.5", "monthly"],
  ["order-tracking.html", "0.5", "monthly"],
  ["refund-exchange.html", "0.4", "monthly"],
  ["privacy-policy.html", "0.3", "yearly"],
  ["terms.html", "0.3", "yearly"],
  ...products.map((p) => [`product/${p.slug}.html`, "0.8", "weekly"]),
];
writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map(([loc, priority, changefreq]) => `  <url>\n    <loc>${SITE.domain}/${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`)
    .join("\n")}\n</urlset>\n`
);
console.log("sitemap.xml written");
