/* ============================================================
   Golden Chair King — site.js
   Shared behaviors:
     - Cart (localStorage, works on static hosting)
     - EN / BN language toggle (data-bn attributes)
     - Mobile menu + cart drawers (+ overlay, Escape, scroll lock)
     - Offer countdown, scroll reveal, back-to-top, toasts
   ============================================================ */
(function () {
  "use strict";

  var WA_NUMBER = "8801521431725"; // order WhatsApp number
  var CART_KEY = "gck_cart_v1";
  var LANG_KEY = "gck_lang";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function money(n) { return "\u09F3" + Number(n).toLocaleString("en-IN"); }

  /* ================= Language (EN / BN) ================= */
  function currentLang() {
    try { return localStorage.getItem(LANG_KEY) === "bn" ? "bn" : "en"; } catch (e) { return "en"; }
  }

  function applyLang(lang) {
    var isBn = lang === "bn";
    document.documentElement.lang = isBn ? "bn" : "en";
    if (document.body) document.body.classList.toggle("lang-bn", isBn);

    $$("[data-bn]").forEach(function (el) {
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", (el.textContent || "").trim());
      el.textContent = isBn ? el.getAttribute("data-bn") : el.getAttribute("data-en");
    });
    $$("[data-bn-ph]").forEach(function (el) {
      if (!el.hasAttribute("data-en-ph")) el.setAttribute("data-en-ph", el.getAttribute("placeholder") || "");
      el.setAttribute("placeholder", isBn ? el.getAttribute("data-bn-ph") : el.getAttribute("data-en-ph"));
    });

    $$(".lang-toggle-label").forEach(function (el) { el.textContent = isBn ? "EN" : "\u09ac\u09be\u0982\u09b2\u09be"; });
    $$(".lang-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", isBn ? "Switch to English" : "Switch to Bangla");
    });

    try { localStorage.setItem(LANG_KEY, isBn ? "bn" : "en"); } catch (e) {}
    renderCart();
  }

  /* ================= Cart ================= */
  function readCart() {
    try {
      var c = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(c) ? c : [];
    } catch (e) { return []; }
  }
  function writeCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    renderCart();
  }
  function cartCount() {
    return readCart().reduce(function (n, i) { return n + (i.qty || 1); }, 0);
  }
  function cartSubtotal() {
    return readCart().reduce(function (n, i) { return n + (i.qty || 1) * (i.price || 0); }, 0);
  }

  function addToCart(item, qty) {
    var q = Math.max(1, parseInt(qty || 1, 10) || 1);
    var cart = readCart();
    var found = null;
    for (var k = 0; k < cart.length; k++) { if (cart[k].id === item.id) { found = cart[k]; break; } }
    if (found) { found.qty = (found.qty || 1) + q; }
    else { item.qty = q; cart.push(item); }
    writeCart(cart);
    var lang = currentLang();
    var name = lang === "bn" ? (item.nameBn || item.name) : item.name;
    toast(lang === "bn" ? name + " \u0995\u09be\u09b0\u09cd\u099f\u09c7 \u09af\u09c1\u0995\u09cd\u09a4 \u09b9\u09df\u09c7\u099b\u09c7" : name + " added to cart");
  }
  function setQty(id, qty) {
    var cart = readCart();
    cart.forEach(function (i) { if (i.id === id) i.qty = Math.max(1, qty); });
    writeCart(cart);
  }
  function removeFromCart(id) {
    writeCart(readCart().filter(function (i) { return i.id !== id; }));
  }

  function renderCart() {
    var lang = currentLang();
    var count = cartCount();
    $$(".cart-count").forEach(function (el) {
      el.textContent = count;
      el.style.display = count === 0 ? "none" : "inline-flex";
    });
    var itemsEl = $("#cart-items");
    if (!itemsEl) return;
    var subtotalEl = $("#cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = money(cartSubtotal());

    var cart = readCart();
    if (!cart.length) {
      itemsEl.innerHTML =
        '<div class="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">' +
          '<span class="flex size-16 items-center justify-center rounded-full bg-base-200 text-base-content/40"><svg class="size-7"><use href="#i-cart"/></svg></span>' +
          '<p class="font-bold text-navy-900">' + (lang === "bn" ? "\u0995\u09be\u09b0\u09cd\u099f \u098f\u0996\u09a8 \u0996\u09be\u09b2\u09bf" : "Your cart is empty") + "</p>" +
          '<p class="max-w-[240px] text-sm text-base-content/60">' + (lang === "bn" ? "\u0995\u09be\u09b2\u09c7\u0995\u09b6\u09a8 \u0998\u09c1\u09b0\u09c7 \u09a6\u09c7\u0996\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u099b\u09a8\u09cd\u09a6\u09c7\u09b0 \u09aa\u09a3\u09cd\u09af \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964" : "Browse our collection and add your favourites.") + "</p>" +
          '<a class="btn btn-secondary btn-sm mt-1 font-bold" href="shop.html">' + (lang === "bn" ? "\u098f\u0996\u09a8\u0987 \u0995\u09bf\u09a8\u09c1\u09a8" : "Shop Now") + "</a>" +
        "</div>";
      return;
    }

    itemsEl.innerHTML = cart.map(function (i) {
      var name = lang === "bn" ? (i.nameBn || i.name) : i.name;
      return '<div class="flex gap-3 rounded-2xl border border-base-300 bg-base-100 p-3">' +
        '<img src="' + i.img + '" alt="' + name + '" width="72" height="72" loading="lazy" class="size-[72px] shrink-0 rounded-xl bg-base-200 object-cover">' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<p class="text-sm leading-snug font-bold text-navy-900">' + name + "</p>" +
            '<button type="button" class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error" data-remove="' + i.id + '" aria-label="Remove"><svg class="size-4"><use href="#i-trash"/></svg></button>' +
          "</div>" +
          '<div class="mt-2 flex items-center justify-between gap-2">' +
            '<div class="join rounded-lg border border-base-300 bg-base-100">' +
              '<button type="button" class="join-item btn btn-sm px-2.5" data-dec="' + i.id + '" aria-label="Decrease"><svg class="size-3.5"><use href="#i-minus"/></svg></button>' +
              '<span class="join-item flex min-w-9 items-center justify-center text-sm font-bold">' + i.qty + "</span>" +
              '<button type="button" class="join-item btn btn-sm px-2.5" data-inc="' + i.id + '" aria-label="Increase"><svg class="size-3.5"><use href="#i-plus"/></svg></button>' +
            "</div>" +
            '<span class="text-sm font-extrabold text-primary">' + money((i.price || 0) * (i.qty || 1)) + "</span>" +
          "</div>" +
        "</div>" +
      "</div>";
    }).join("");
    renderCartPage(cart, lang);
  }

  /* cart page + checkout summary (filled when those elements exist) */
  function renderCartPage(cart, lang) {
    var pageItems = document.getElementById("cart-page-items");
    if (pageItems) {
      if (!cart.length) {
        pageItems.innerHTML =
          '<div class="flex flex-col items-center gap-3 rounded-3xl border border-base-300 bg-base-100 py-16 text-center">' +
            '<span class="flex size-16 items-center justify-center rounded-full bg-base-200 text-base-content/40"><svg class="size-7"><use href="#i-cart"/></svg></span>' +
            '<p class="font-bold text-navy-900">' + (lang === "bn" ? "\u0995\u09be\u09b0\u09cd\u099f \u098f\u0996\u09a8 \u0996\u09be\u09b2\u09bf" : "Your cart is empty") + "</p>" +
            '<a class="btn btn-gold btn-sm font-bold" href="shop.html">' + (lang === "bn" ? "\u098f\u0996\u09a8\u0987 \u0995\u09bf\u09a8\u09c1\u09a8" : "Shop Now") + "</a>" +
          "</div>";
      } else {
        pageItems.innerHTML = cart.map(function (i) {
          var name = lang === "bn" ? (i.nameBn || i.name) : i.name;
          return '<div class="flex gap-4 rounded-2xl border border-base-300 bg-base-100 p-4">' +
            '<img src="' + i.img + '" alt="' + name + '" width="88" height="88" loading="lazy" class="size-20 shrink-0 rounded-xl bg-base-200 object-cover sm:size-22">' +
            '<div class="min-w-0 flex-1">' +
              '<div class="flex items-start justify-between gap-3">' +
                '<p class="text-sm font-bold text-navy-900 sm:text-base">' + name + "</p>" +
                '<button type="button" class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error" data-remove="' + i.id + '" aria-label="Remove"><svg class="size-4"><use href="#i-trash"/></svg></button>' +
              "</div>" +
              '<div class="mt-3 flex flex-wrap items-center justify-between gap-3">' +
                '<div class="join rounded-lg border border-base-300 bg-base-100">' +
                  '<button type="button" class="join-item btn btn-sm px-2.5" data-dec="' + i.id + '" aria-label="Decrease"><svg class="size-3.5"><use href="#i-minus"/></svg></button>' +
                  '<span class="join-item flex min-w-9 items-center justify-center text-sm font-bold">' + i.qty + "</span>" +
                  '<button type="button" class="join-item btn btn-sm px-2.5" data-inc="' + i.id + '" aria-label="Increase"><svg class="size-3.5"><use href="#i-plus"/></svg></button>' +
                "</div>" +
                '<span class="font-display text-base font-bold text-navy-900">' + money(i.price * i.qty) + "</span>" +
              "</div>" +
            "</div>" +
          "</div>";
        }).join("");
      }
      var ps = document.getElementById("cart-page-subtotal");
      if (ps) ps.textContent = money(cartSubtotal());
      var pt = document.getElementById("cart-page-total");
      if (pt) pt.textContent = money(cartSubtotal());
      var cb = document.getElementById("cart-checkout-btn");
      if (cb) {
        if (!cart.length) cb.classList.add("pointer-events-none", "opacity-50");
        else cb.classList.remove("pointer-events-none", "opacity-50");
      }
    }
    var coItems = document.getElementById("co-items");
    if (coItems) {
      if (!cart.length) {
        coItems.innerHTML = '<p class="text-sm text-base-content/60">Your cart is empty \u2014 <a class="font-bold text-gold-700 underline underline-offset-2" href="shop.html">add a chair</a> first.</p>';
      } else {
        coItems.innerHTML = cart.map(function (i) {
          return '<div class="flex items-center gap-3">' +
            '<img src="' + i.img + '" alt="' + i.name + '" width="44" height="44" loading="lazy" class="size-11 shrink-0 rounded-lg bg-base-200 object-cover">' +
            '<div class="min-w-0 flex-1"><p class="truncate text-[13px] font-bold text-navy-900">' + i.name + '</p><p class="text-[11px] font-semibold text-base-content/50">' + i.qty + " \u00D7 " + money(i.price) + "</p></div>" +
            '<span class="text-sm font-extrabold text-navy-900">' + money(i.price * i.qty) + "</span>" +
          "</div>";
        }).join("");
      }
      var cs = document.getElementById("co-subtotal");
      if (cs) cs.textContent = money(cartSubtotal());
    }
  }

  /* read product data off an [data-add] / [data-buy-now] element */
  function itemFromEl(el) {
    return {
      id: el.getAttribute("data-id"),
      name: el.getAttribute("data-name"),
      nameBn: el.getAttribute("data-name-bn"),
      price: parseFloat(el.getAttribute("data-price") || "0"),
      img: el.getAttribute("data-img")
    };
  }
  function qtyFromEl(el) {
    var sel = el.getAttribute("data-qty-from");
    if (!sel) return 1;
    var inp = document.querySelector(sel);
    return inp ? Math.max(1, parseInt(inp.value || "1", 10) || 1) : 1;
  }

  /* ================= WhatsApp order helper ================= */
  function waOrder(el) {
    var lang = currentLang();
    var name = el.getAttribute("data-name") || "";
    var price = el.getAttribute("data-price");
    var msg = lang === "bn"
      ? "\u0986\u09b8\u09b8\u09be\u09b2\u09be\u09ae\u09c1 \u0986\u09b2\u09be\u0987\u0995\u09c1\u09ae! \u0986\u09ae\u09bf \u0985\u09b0\u09cd\u09a1\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u099a\u09be\u0987: " + name + (price ? " \u2014 \u09F3" + Number(price).toLocaleString("en-IN") : "") + "\u0964 \u09b8\u09cd\u099f\u0995 \u0993 \u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf \u099c\u09be\u09a8\u09be\u09ac\u09c7\u09a8 \u09aa\u09cd\u09b2\u09bf\u099c\u0964"
      : "Assalamu Alaikum! I want to order: " + name + (price ? " \u2014 \u09F3" + Number(price).toLocaleString("en-IN") : "") + ". Please confirm stock & delivery.";
    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  }

  /* ================= Drawers (menu / cart) ================= */
  function closeDrawers() {
    [{ id: "mobile-menu", cls: "-translate-x-full" }, { id: "cart-drawer", cls: "translate-x-full" }].forEach(function (d) {
      var el = document.getElementById(d.id);
      if (!el) return;
      el.classList.remove("translate-x-0");
      el.classList.add(d.cls);
      el.setAttribute("aria-hidden", "true");
    });
    var ov = $("#overlay");
    if (ov) { ov.classList.add("hidden"); ov.classList.remove("opacity-100"); }
    document.documentElement.style.overflow = "";
  }
  function openDrawer(id) {
    closeDrawers();
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("translate-x-full");
    el.classList.remove("-translate-x-full");
    el.classList.add("translate-x-0");
    el.setAttribute("aria-hidden", "false");
    var ov = $("#overlay");
    if (ov) {
      ov.classList.remove("hidden");
      requestAnimationFrame(function () { ov.classList.add("opacity-100"); });
    }
    document.documentElement.style.overflow = "hidden";
  }

  /* ================= Toast ================= */
  function toast(msg) {
    var box = $("#toasts");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "toast-item pointer-events-auto flex items-center gap-2.5 rounded-full bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white shadow-2xl ring-1 ring-gold-400/40";
    el.innerHTML = '<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-400 text-navy-950"><svg class="size-3"><use href="#i-check"/></svg></span><span></span>';
    el.lastElementChild.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("toast-in"); });
    setTimeout(function () {
      el.classList.remove("toast-in");
      setTimeout(function () { el.remove(); }, 300);
    }, 2400);
  }

  /* ================= Countdown (offer ends at midnight) ================= */
  function initCountdown() {
    var nodes = $$("[data-countdown]");
    if (!nodes.length) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(24, 0, 0, 0);
      var diff = Math.max(0, end - now);
      var h = pad(Math.floor(diff / 3600000));
      var m = pad(Math.floor((diff % 3600000) / 60000));
      var s = pad(Math.floor((diff % 60000) / 1000));
      nodes.forEach(function (n) {
        var hEl = n.querySelector('[data-cd="h"]');
        var mEl = n.querySelector('[data-cd="m"]');
        var sEl = n.querySelector('[data-cd="s"]');
        if (hEl && hEl.textContent !== h) { hEl.textContent = h; pulse(hEl); }
        if (mEl && mEl.textContent !== m) { mEl.textContent = m; pulse(mEl); }
        if (sEl && sEl.textContent !== s) { sEl.textContent = s; pulse(sEl); }
      });
    }
    function pulse(el) {
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ================= Scroll reveal (stagger + variants + underline draw) ================= */
  function initReveal() {
    var els = $$("[data-reveal]");
    if (!els.length) return;

    // stagger: direct children of [data-stagger] containers reveal in sequence
    $$("[data-stagger]").forEach(function (box) {
      var kids = Array.prototype.slice.call(box.querySelectorAll(":scope > [data-reveal]"));
      kids.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      });
    });

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("reveal", "reveal-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("reveal-in");
        io.unobserve(el);
        // draw section-title underlines inside the revealed block
        Array.prototype.slice.call(el.querySelectorAll(".title-underline")).forEach(function (t) {
          t.classList.add("title-drawn");
        });
        // free the element from reveal transitions so hover stays snappy
        var delay = parseFloat(el.style.transitionDelay) || 0;
        window.setTimeout(function () {
          el.classList.remove("reveal", "reveal-in");
          el.style.transitionDelay = "";
        }, 1300 + delay);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -36px 0px" });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  /* ================= Animated counters ================= */
  function initCounters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count") || "0");
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var start = null;
      var DUR = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / DUR);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toLocaleString("en-IN", {
          minimumFractionDigits: dec,
          maximumFractionDigits: dec
        });
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animate(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) {
      el.textContent = "0";
      io.observe(el);
    });
  }

  /* ================= Lazy image fade (handled in CSS via .img-fade) ================= */

  /* ================= Scroll UI (header shadow, back to top) ================= */
  function initScrollUI() {
    var toTops = [$("#to-top"), $("#to-top-mobile")].filter(Boolean);
    var header = $("#site-header");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      toTops.forEach(function (el) {
        el.classList.toggle("opacity-0", y < 480);
        el.classList.toggle("pointer-events-none", y < 480);
      });
      if (header) header.classList.toggle("is-scrolled", y > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    toTops.forEach(function (el) {
      el.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ================= Product gallery ================= */
  function initGallery() {
    var main = document.getElementById("gallery-main");
    if (!main) return;
    $$("[data-gallery-thumb]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = btn.getAttribute("data-src");
        if (!src) return;
        main.src = src;
        $$("[data-gallery-thumb]").forEach(function (b) {
          b.classList.remove("border-gold-400", "ring-2", "ring-gold-400/40");
          b.classList.add("border-base-300");
        });
        btn.classList.remove("border-base-300");
        btn.classList.add("border-gold-400", "ring-2", "ring-gold-400/40");
      });
    });
  }

  /* ================= Shop filters ================= */
  function initShop() {
    var grid = document.getElementById("shop-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-slug]"));
    var state = { cat: "", q: "", min: null, max: null, deal: false, sort: "featured" };
    var params = new URLSearchParams(window.location.search);
    if (params.get("cat")) state.cat = params.get("cat");
    if (params.get("q")) state.q = params.get("q");
    if (params.get("deal") === "1") state.deal = true;

    var searchEl = document.getElementById("shop-search");
    var minEl = document.getElementById("shop-min");
    var maxEl = document.getElementById("shop-max");
    var sortEl = document.getElementById("shop-sort");
    if (searchEl && state.q) searchEl.value = state.q;

    function chipSync() {
      $$("[data-cat-filter]").forEach(function (b) {
        b.classList.toggle("active", (b.getAttribute("data-cat-filter") || "") === state.cat);
      });
      $$("[data-deal-filter]").forEach(function (b) { b.classList.toggle("active", state.deal); });
    }
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var price = parseFloat(c.getAttribute("data-price") || "0");
        var ok = true;
        if (state.cat && c.getAttribute("data-cat") !== state.cat) ok = false;
        if (ok && state.q && (c.getAttribute("data-search") || "").indexOf(state.q.toLowerCase()) === -1) ok = false;
        if (ok && state.min !== null && price < state.min) ok = false;
        if (ok && state.max !== null && price > state.max) ok = false;
        if (ok && state.deal && c.getAttribute("data-deal") !== "1") ok = false;
        c.classList.toggle("hidden", !ok);
        if (ok) shown++;
      });
      var sorted = cards.slice();
      if (state.sort !== "featured") {
        sorted.sort(function (a, b) {
          var pa = parseFloat(a.getAttribute("data-price") || "0");
          var pb = parseFloat(b.getAttribute("data-price") || "0");
          if (state.sort === "price-asc") return pa - pb;
          if (state.sort === "price-desc") return pb - pa;
          if (state.sort === "rating") return parseFloat(b.getAttribute("data-rating") || "0") - parseFloat(a.getAttribute("data-rating") || "0");
          var da = 1 - pa / (parseFloat(a.getAttribute("data-old") || "") || pa || 1);
          var db = 1 - pb / (parseFloat(b.getAttribute("data-old") || "") || pb || 1);
          return db - da;
        });
      }
      sorted.forEach(function (c) { grid.appendChild(c); });
      var count = document.getElementById("shop-count");
      if (count) count.textContent = "Showing " + shown + " of " + cards.length + " chairs";
      var empty = document.getElementById("shop-empty");
      if (empty) empty.classList.toggle("hidden", shown !== 0);
      var p = new URLSearchParams();
      if (state.cat) p.set("cat", state.cat);
      if (state.q) p.set("q", state.q);
      if (state.deal) p.set("deal", "1");
      var qs = p.toString();
      window.history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
    }
    $$("[data-cat-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.cat = b.getAttribute("data-cat-filter") || "";
        chipSync();
        apply();
      });
    });
    $$("[data-deal-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.deal = !state.deal;
        chipSync();
        apply();
      });
    });
    if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value.trim(); apply(); });
    if (minEl) minEl.addEventListener("input", function () { state.min = minEl.value === "" ? null : parseFloat(minEl.value); apply(); });
    if (maxEl) maxEl.addEventListener("input", function () { state.max = maxEl.value === "" ? null : parseFloat(maxEl.value); apply(); });
    if (sortEl) sortEl.addEventListener("change", function () { state.sort = sortEl.value; apply(); });
    function clearAll() {
      state = { cat: "", q: "", min: null, max: null, deal: false, sort: "featured" };
      if (searchEl) searchEl.value = "";
      if (minEl) minEl.value = "";
      if (maxEl) maxEl.value = "";
      if (sortEl) sortEl.value = "featured";
      chipSync();
      apply();
    }
    var clearBtn = document.getElementById("shop-clear");
    if (clearBtn) clearBtn.addEventListener("click", clearAll);
    var emptyClear = document.getElementById("shop-empty-clear");
    if (emptyClear) emptyClear.addEventListener("click", clearAll);
    chipSync();
    apply();
  }

  /* ================= Checkout ================= */
  function initCheckout() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    function selectedPay() {
      var el = form.querySelector("input[name='payment']:checked");
      return el ? el.value : "cod";
    }
    function syncPanels() {
      var pay = selectedPay();
      $$("[data-pay-panel]").forEach(function (p) {
        p.classList.toggle("hidden", p.getAttribute("data-pay-panel") !== pay);
      });
    }
    $$("input[name='payment']").forEach(function (r) { r.addEventListener("change", syncPanels); });
    syncPanels();

    function toggleErr(id, bad) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle("hidden", !bad);
      return !bad;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("co-name").value || "").trim();
      var phone = (document.getElementById("co-phone").value || "").trim();
      var address = (document.getElementById("co-address").value || "").trim();
      var district = document.getElementById("co-district").value;
      var pay = selectedPay();
      var trx = "";
      if (pay === "bkash" || pay === "nagad") {
        var tEl = document.getElementById("co-trx-" + pay);
        trx = tEl ? tEl.value.trim() : "";
      }
      var ok = true;
      ok = toggleErr("err-name", !name) && ok;
      ok = toggleErr("err-phone", !/^(\+?880|0)1[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) && ok;
      ok = toggleErr("err-address", !address) && ok;
      ok = toggleErr("err-district", !district) && ok;
      if (pay === "bkash" || pay === "nagad") ok = toggleErr("err-trx-" + pay, !trx) && ok;
      var cart = readCart();
      if (!cart.length) {
        toast(currentLang() === "bn" ? "\u0995\u09be\u09b0\u09cd\u099f \u0996\u09be\u09b2\u09bf \u2014 \u0986\u0997\u09c7 \u099a\u09c7\u09df\u09be\u09b0 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8" : "Your cart is empty \u2014 add a chair first");
        ok = false;
      }
      if (!ok) return;

      var lines = [];
      lines.push("\uD83D\uDED2 New order \u2014 Golden Chair King");
      lines.push("");
      lines.push("Name: " + name);
      lines.push("Phone: " + phone);
      var email = (document.getElementById("co-email").value || "").trim();
      if (email) lines.push("Email: " + email);
      var area = (document.getElementById("co-area").value || "").trim();
      lines.push("Address: " + address + ", " + (area ? area + ", " : "") + district);
      lines.push("");
      lines.push("Items:");
      cart.forEach(function (i, n) {
        lines.push((n + 1) + ". " + i.name + " \u00D7 " + i.qty + " \u2014 \u09F3" + (i.price * i.qty).toLocaleString("en-IN"));
      });
      lines.push("");
      lines.push("Subtotal: \u09F3" + cartSubtotal().toLocaleString("en-IN"));
      var payLabel = pay === "cod" ? "Cash on Delivery" : pay === "bkash" ? "bKash (advance)" : "Nagad (advance)";
      lines.push("Payment: " + payLabel + (trx ? " \u2014 TrxID: " + trx : ""));
      var note = (document.getElementById("co-note").value || "").trim();
      if (note) lines.push("Note: " + note);
      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");

      form.classList.add("hidden");
      var succ = document.getElementById("checkout-success");
      if (succ) {
        succ.classList.remove("hidden");
        var recap = document.getElementById("co-success-summary");
        if (recap) recap.textContent = lines.join("\n");
        var again = document.getElementById("co-wa-again");
        if (again) again.href = url;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ================= Order tracking (demo flow) ================= */
  function initTracking() {
    var form = document.getElementById("track-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (document.getElementById("track-input").value || "").trim();
      if (!v) return;
      var res = document.getElementById("track-result");
      if (res) res.classList.remove("hidden");
      var link = document.getElementById("track-wa");
      if (link) {
        link.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Assalamu Alaikum! Please check my order status. Phone / reference: " + v);
      }
      if (res && res.scrollIntoView) res.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ================= Contact form (opens WhatsApp) ================= */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("ct-name").value || "").trim();
      var phone = (document.getElementById("ct-phone").value || "").trim();
      var msg = (document.getElementById("ct-msg").value || "").trim();
      var ok = true;
      function toggleErr(id, bad) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle("hidden", !bad);
        return !bad;
      }
      ok = toggleErr("err-ct-name", !name) && ok;
      ok = toggleErr("err-ct-msg", !msg) && ok;
      if (!ok) return;
      var text = "Assalamu Alaikum! I'm " + name + (phone ? " (" + phone + ")" : "") + ".\n\n" + msg;
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      toast(currentLang() === "bn" ? "\u09b9\u09cb\u09df\u09be\u099f\u09b8\u0985\u09cd\u09af\u09be\u09aa \u0996\u09cb\u09b2\u09be \u09b9\u09df\u09c7\u099b\u09c7 \u2014 Send \u099a\u09be\u09aa\u09c1\u09a8" : "WhatsApp opened \u2014 press Send to reach us");
      form.reset();
    });
  }

  /* ================= Hero slider ================= */
  function initHeroSlider() {
    var slider = document.getElementById("hero-slider");
    if (!slider) return;
    var track = document.getElementById("hero-track");
    if (!track) return;
    var allSlides = Array.prototype.slice.call(track.children);
    var allDots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (allSlides.length < 2) return;
    var idx = 0;
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var slides = [];
    var dots = [];

    function isVisible(el) {
      return el.offsetParent !== null && window.getComputedStyle(el).display !== "none";
    }
    function sync() {
      slides = allSlides.filter(isVisible);
      dots = allDots.filter(isVisible);
      if (!slides.length) return;
      if (idx >= slides.length) idx = 0;
      go(idx);
    }
    function go(i) {
      if (!slides.length) return;
      idx = (i % slides.length + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (d, k) { d.classList.toggle("active", k === idx); });
      slides.forEach(function (s, k) { s.setAttribute("aria-label", (k + 1) + " of " + slides.length); });
    }
    function start() {
      if (reduce || timer) return;
      timer = window.setInterval(function () { go(idx + 1); }, 6500);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function manual(i) { go(i); stop(); start(); }

    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (prev) prev.addEventListener("click", function () { manual(idx - 1); });
    if (next) next.addEventListener("click", function () { manual(idx + 1); });
    allDots.forEach(function (d) {
      d.addEventListener("click", function () { manual(dots.indexOf(d)); });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    var x0 = null;
    slider.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 45) manual(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });

    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") manual(idx - 1);
      if (e.key === "ArrowRight") manual(idx + 1);
    });

    // re-derive visible slides when the breakpoint changes (some slides are hidden on phones)
    window.addEventListener("resize", function () {
      stop();
      sync();
      start();
    });

    sync();
    start();
  }

  /* ================= Delegated events ================= */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;

    var add = t.closest("[data-add]");
    if (add) {
      e.preventDefault();
      addToCart(itemFromEl(add), qtyFromEl(add));
      return;
    }

    var buy = t.closest("[data-buy-now]");
    if (buy) {
      e.preventDefault();
      addToCart(itemFromEl(buy), qtyFromEl(buy));
      window.location.href = "checkout.html";
      return;
    }

    var qinc = t.closest("[data-qty-inc]");
    if (qinc) {
      var qin = document.getElementById(qinc.getAttribute("data-qty-inc"));
      if (qin) qin.value = Math.min(20, (parseInt(qin.value || "1", 10) || 1) + 1);
      return;
    }
    var qdec = t.closest("[data-qty-dec]");
    if (qdec) {
      var qin2 = document.getElementById(qdec.getAttribute("data-qty-dec"));
      if (qin2) qin2.value = Math.max(1, (parseInt(qin2.value || "1", 10) || 1) - 1);
      return;
    }

    if (t.closest("[data-open-cart]")) { e.preventDefault(); renderCart(); openDrawer("cart-drawer"); return; }
    if (t.closest("[data-open-menu]")) { e.preventDefault(); openDrawer("mobile-menu"); return; }
    if (t.closest("[data-close]")) { e.preventDefault(); closeDrawers(); return; }
    if (t.id === "overlay") { closeDrawers(); return; }

    var inc = t.closest("[data-inc]");
    if (inc) {
      var incId = inc.getAttribute("data-inc");
      var item1 = readCart().filter(function (x) { return x.id === incId; })[0];
      if (item1) setQty(incId, (item1.qty || 1) + 1);
      return;
    }
    var dec = t.closest("[data-dec]");
    if (dec) {
      var decId = dec.getAttribute("data-dec");
      var item2 = readCart().filter(function (x) { return x.id === decId; })[0];
      if (item2) {
        if ((item2.qty || 1) <= 1) removeFromCart(decId);
        else setQty(decId, item2.qty - 1);
      }
      return;
    }
    var rem = t.closest("[data-remove]");
    if (rem) { removeFromCart(rem.getAttribute("data-remove")); return; }

    var wa = t.closest("[data-wa]");
    if (wa) { e.preventDefault(); waOrder(wa); return; }

    if (t.closest(".lang-toggle")) {
      e.preventDefault();
      applyLang(currentLang() === "bn" ? "en" : "bn");
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawers();
  });

  /* ================= Init ================= */
  function init() {
    applyLang(currentLang());
    renderCart();
    initCountdown();
    initCounters();
    initReveal();
    initScrollUI();
    initGallery();
    initShop();
    initCheckout();
    initTracking();
    initContactForm();
    initHeroSlider();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
