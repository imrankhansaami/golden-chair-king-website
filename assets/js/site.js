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

  function addToCart(item) {
    var cart = readCart();
    var found = null;
    for (var k = 0; k < cart.length; k++) { if (cart[k].id === item.id) { found = cart[k]; break; } }
    if (found) { found.qty = (found.qty || 1) + 1; }
    else { item.qty = 1; cart.push(item); }
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
    var toTop = $("#to-top");
    var header = $("#site-header");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (toTop) {
        toTop.classList.toggle("opacity-0", y < 480);
        toTop.classList.toggle("pointer-events-none", y < 480);
      }
      if (header) header.classList.toggle("is-scrolled", y > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ================= Delegated events ================= */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;

    var add = t.closest("[data-add]");
    if (add) {
      e.preventDefault();
      addToCart({
        id: add.getAttribute("data-id"),
        name: add.getAttribute("data-name"),
        nameBn: add.getAttribute("data-name-bn"),
        price: parseFloat(add.getAttribute("data-price") || "0"),
        img: add.getAttribute("data-img")
      });
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
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
