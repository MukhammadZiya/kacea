/* KACEA — language switching, header, menu, reveals, credits */
(function () {
  'use strict';

  var root = document.documentElement;
  var dict = window.KACEA_I18N || {};
  var SUPPORTED = ['en', 'ko', 'ar'];
  var STORAGE_KEY = 'kacea-lang';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- i18n ---------------- */
  // Keep the English copy written in the HTML as the source of truth.
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var attrNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-attr]'));
  var metaDesc = document.querySelector('meta[name="description"]');

  function t(lang, key) {
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || null;
  }

  function apply(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';

    nodes.forEach(function (el) {
      var value = t(lang, el.getAttribute('data-i18n'));
      if (value != null) el.textContent = value;
    });
    attrNodes.forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        var value = t(lang, parts[1]);
        if (value != null) el.setAttribute(parts[0], value);
      });
    });

    var title = t(lang, 'meta.title');
    if (title) document.title = title;
    var desc = t(lang, 'meta.description');
    if (desc && metaDesc) metaDesc.setAttribute('content', desc);

    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
  }

  function persist(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try {
      var url = new URL(location.href);
      if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0 || lang === root.lang) return;
    persist(lang);
    if (reduceMotion) { apply(lang); return; }
    // Fade out, swap text, fade back in.
    root.classList.add('i18n-swap');
    window.setTimeout(function () {
      apply(lang);
      requestAnimationFrame(function () { root.classList.remove('i18n-swap'); });
    }, 280);
  }

  document.querySelectorAll('.lang-switch button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  // Initial language was decided in <head>; just fill in the text.
  apply(SUPPORTED.indexOf(root.lang) >= 0 ? root.lang : 'en');
  function reveal() { root.classList.remove('i18n-pending'); }
  requestAnimationFrame(reveal);
  window.setTimeout(reveal, 300); // fallback when animation frames are paused

  /* ---------------- Header state ---------------- */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-solid', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 }).observe(hero);
  } else {
    header.classList.add('is-solid');
  }

  /* ---------------- Mobile menu ---------------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  function closeMenu() {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  toggle.addEventListener('click', function () {
    var open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------------- Reveal on scroll ---------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // Stagger siblings that appear together.
    document.querySelectorAll('.pillars, .stats, .mosaic, .join-cards').forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
        el.style.setProperty('--d', (i * 0.1) + 's');
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Photo credits ---------------- */
  var dialog = document.getElementById('credits');
  var list = document.getElementById('credits-list');
  function renderCredits() {
    if (!list || !window.KACEA_CREDITS) return;
    list.textContent = '';
    window.KACEA_CREDITS.forEach(function (c) {
      var li = document.createElement('li');
      li.setAttribute('dir', 'ltr');
      var a = document.createElement('a');
      a.href = c.source; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = c.title;
      li.appendChild(a);
      li.appendChild(document.createTextNode(' — ' + c.author + ' · '));
      if (c.licenseUrl) {
        var l = document.createElement('a');
        l.href = c.licenseUrl; l.target = '_blank'; l.rel = 'noopener license';
        l.textContent = c.license;
        li.appendChild(l);
      } else {
        li.appendChild(document.createTextNode(c.license));
      }
      list.appendChild(li);
    });
  }
  var openBtn = document.getElementById('credits-open');
  var closeBtn = document.getElementById('credits-close');
  if (dialog && openBtn && typeof dialog.showModal === 'function') {
    openBtn.addEventListener('click', function () { renderCredits(); dialog.showModal(); });
    closeBtn.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------------- Footer year ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
