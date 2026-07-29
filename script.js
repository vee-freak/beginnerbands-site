/* ═══════════════════════════════════════════════════════════
   JA BEGINNER BANDS — interactions
   No dependencies. Everything degrades gracefully without JS.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. STORE CONFIG  ←  edit here
     ─────────────────────────────────────────────────────────
     ASIN is shared across both marketplaces.
     `tag` is your Amazon Associates tracking id — leave '' if unused.
     `price` is display-only; update it when Amazon pricing changes.
  */
  var ASIN = 'B0DLPWCJYR';

  var STORES = {
    us: {
      name: 'Amazon US',
      short: 'Amazon',
      host: 'https://www.amazon.com',
      tag: '',
      price: 49.99,
      currency: 'USD',
      locale: 'en-US'
    },
    ca: {
      name: 'Amazon Canada',
      short: 'Amazon.ca',
      host: 'https://www.amazon.ca',
      tag: '',
      price: 67.79,
      currency: 'CAD',
      locale: 'en-CA'
    }
  };

  var CA_ZONES = /America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton|Glace_Bay|Goose_Bay|Whitehorse|Yellowknife|Iqaluit|Dawson|Inuvik|Rankin_Inlet|Resolute|Swift_Current|Creston|Fort_Nelson|Blanc-Sablon|Atikokan|Cambridge_Bay|Nipigon|Rainy_River|Thunder_Bay)/;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─────────────────────────────────────────────────────────
     2. STORE SELECTION
     ───────────────────────────────────────────────────────── */
  var store = 'us';

  function detectStore() {
    try {
      var saved = localStorage.getItem('bb_store');
      if (saved && STORES[saved]) return saved;
    } catch (e) { /* private mode */ }

    // URL override, e.g. ?store=ca
    var q = new URLSearchParams(location.search).get('store');
    if (q && STORES[q.toLowerCase()]) return q.toLowerCase();

    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (CA_ZONES.test(tz)) return 'ca';
    } catch (e) { /* older browser */ }

    var lang = (navigator.language || '').toLowerCase();
    if (lang === 'en-ca' || lang === 'fr-ca') return 'ca';

    return 'us';
  }

  function buildUrl(key, suffix) {
    var s = STORES[key];
    var url = s.host + '/dp/' + ASIN;
    if (s.tag) url += '?tag=' + encodeURIComponent(s.tag);
    if (suffix) url += suffix;
    return url;
  }

  // "$49.99 USD" / "$67.79 CAD" — the code is spelled out so a shopper is never
  // guessing which dollar they're looking at.
  function money(key) {
    var s = STORES[key];
    if (s.price == null) return '';
    var amount;
    try {
      amount = new Intl.NumberFormat(s.locale, {
        style: 'currency',
        currency: s.currency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2
      }).format(s.price);
    } catch (e) {
      amount = '$' + s.price.toFixed(2);
    }
    return amount + ' ' + s.currency;
  }

  function applyStore(key, persist) {
    store = key;
    if (persist !== false) {
      try { localStorage.setItem('bb_store', key); } catch (e) {}
    }

    // Links — `data-store="auto"` follows the selection; a fixed value stays put.
    $$('.js-buy').forEach(function (a) {
      var target = a.dataset.store === 'auto' || !a.dataset.store ? key : a.dataset.store;
      a.href = buildUrl(target, a.dataset.suffix || '');
      a.setAttribute('rel', 'noopener');
      a.setAttribute('target', '_blank');
    });

    var label = STORES[key].short;
    $$('.js-store-name').forEach(function (el) { el.textContent = label; });

    var priceStr = money(key);
    $$('.js-price').forEach(function (el) { el.textContent = priceStr; });
    $$('.js-price-plain').forEach(function (el) { el.textContent = priceStr; });

    // Segmented controls
    $$('.seg').forEach(function (seg) {
      var btns = $$('.seg__btn', seg);
      btns.forEach(function (b) {
        b.setAttribute('aria-checked', String(b.dataset.store === key));
        b.tabIndex = b.dataset.store === key ? 0 : -1;
      });
      movePill(seg);
    });
  }

  function movePill(seg) {
    var pill = $('.seg__pill', seg);
    var active = $('.seg__btn[aria-checked="true"]', seg);
    if (!pill || !active || !active.offsetWidth) return;
    pill.style.left = active.offsetLeft + 'px';
    pill.style.width = active.offsetWidth + 'px';
    pill.classList.add('on');
  }

  $$('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg__btn');
      if (btn) applyStore(btn.dataset.store);
    });
    // Arrow-key support for the radio group
    seg.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var next = store === 'us' ? 'ca' : 'us';
      applyStore(next);
      var el = $('.seg__btn[data-store="' + next + '"]', seg);
      if (el) el.focus();
    });
  });

  applyStore(detectStore(), false);

  // The pill has to track its button through font swaps, reflows and resizes.
  function syncPills() { $$('.seg').forEach(movePill); }

  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(syncPills);
    $$('.seg').forEach(function (s) { ro.observe(s); });
  }
  window.addEventListener('resize', syncPills);
  window.addEventListener('load', syncPills);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncPills);
  requestAnimationFrame(syncPills);

  /* ─────────────────────────────────────────────────────────
     3. SCROLL REVEALS
     ───────────────────────────────────────────────────────── */
  var revealables = $$('.rv');
  revealables.forEach(function (el) {
    if (el.dataset.rv) el.style.setProperty('--d', el.dataset.rv);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
    $$('.ladder, .score').forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });

    var ladder = $('.ladder');
    if (ladder) io.observe(ladder);
    var score = $('.score');
    if (score) io.observe(score);
  }

  /* Resistance ladder: fill widths, stagger delays, build the level dots. */
  (function buildLadder() {
    var rows = $$('.ladder__row');
    rows.forEach(function (row, i) {
      var sw = $('.swatch', row);
      if (sw) {
        sw.style.setProperty('--w', (row.dataset.w || 100) + '%');
        sw.style.setProperty('--i', i);
      }
      $$('.ladder__lab, .dots', row).forEach(function (el) {
        el.style.setProperty('--i', i);
      });

      var dots = $('.dots', row);
      if (!dots) return;
      var on = +(dots.dataset.on || 0);
      for (var d = 1; d <= 3; d++) {
        var s = document.createElement('span');
        if (d <= on) s.className = 'on';
        dots.appendChild(s);
      }
    });
  })();

  /* ─────────────────────────────────────────────────────────
     4. HEADER STATE + STICKY BUY BAR
     ───────────────────────────────────────────────────────── */
  var hdr = $('#hdr');
  var bbar = $('#bbar');
  var hero = $('.hero');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    hdr.classList.toggle('stuck', y > 24);

    if (bbar && hero) {
      var past = y > hero.offsetHeight * 0.85;
      var atEnd = (y + window.innerHeight) > (document.body.scrollHeight - 320);
      var show = past && !atEnd;
      if (show && bbar.hidden) bbar.hidden = false;
      bbar.classList.toggle('on', show);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────────────────
     5. COUNT-UP NUMBERS
     ───────────────────────────────────────────────────────── */
  var counters = $$('.js-count');
  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var dec = +(el.dataset.dec || 0);
        el.textContent = (+el.dataset.to).toFixed(dec);
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          countUp(en.target);
          cio.unobserve(en.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  function countUp(el) {
    var to = +el.dataset.to;
    var dec = +(el.dataset.dec || 0);
    var dur = 1400;
    var t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = to.toFixed(dec);
    }
    requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────────────────────
     6. FAQ — one open at a time
     ───────────────────────────────────────────────────────── */
  var faqs = $$('.acc__i');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ─────────────────────────────────────────────────────────
     7. MOBILE MENU
     ───────────────────────────────────────────────────────── */
  var navToggle = $('#navToggle');
  var siteNav = $('#siteNav');
  if (navToggle && siteNav) {
    var setNav = function (open) {
      navToggle.setAttribute('aria-expanded', String(open));
      siteNav.classList.toggle('open', open);
    };
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    // close on link tap, outside click, Escape, or once we're back on desktop
    siteNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('click', function (e) {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') setNav(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setNav(false);
    });
  }

  /* ─────────────────────────────────────────────────────────
     8. WELCOME VIDEO — poster overlay until first play
     ───────────────────────────────────────────────────────── */
  var wVid = $('#welcomeVid');
  var wPlay = $('#welcomePlay');
  if (wVid && wPlay) {
    wPlay.addEventListener('click', function () {
      wVid.controls = true;
      var p = wVid.play();
      if (p && p.catch) p.catch(function () {});
    });
    wVid.addEventListener('play', function () { wPlay.hidden = true; });
    // If it ends, invite a rewatch.
    wVid.addEventListener('ended', function () { wPlay.hidden = false; });
  }

  /* ─────────────────────────────────────────────────────────
     9. SMOOTH ANCHORS (offset for the fixed header)
     ───────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - (hdr.offsetHeight + 18);
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ─────────────────────────────────────────────────────────
     10. MISC
     ───────────────────────────────────────────────────────── */
  var yr = $('.js-year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
