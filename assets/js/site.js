/* Yonghao Yu, personal homepage: theme and language toggles, news disclosure, BibTeX panels,
   and copy buttons, header section highlight. No dependencies. The pre-paint script in <head> has
   already set <html class="js" data-theme data-lang lang> and exposes window.__site. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var site = window.__site || {};

  function put(key, value) {
    if (site.put) { site.put(key, value); return; }
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }
  function get(key) {
    if (site.get) return site.get(key);
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function lang() { return root.getAttribute('data-lang') === 'zh' ? 'zh' : 'en'; }
  function theme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#121212' : '#fafaf8');
  }
  function applyLang(l) {
    if (site.applyLang) return site.applyLang(l);
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'zh' ? 'zh-Hans' : 'en');
    return l;
  }

  var themeBtn = doc.getElementById('theme-toggle');
  var langBtn = doc.getElementById('lang-toggle');

  /* Accessible names and tooltips that depend on the language and theme. Both language versions
     sit in the markup as data attributes next to the element they belong to. */
  function paint() {
    var l = lang();
    if (themeBtn) {
      var target = theme() === 'dark' ? 'light' : 'dark';
      themeBtn.setAttribute('aria-label', themeBtn.getAttribute('data-label-' + target + '-' + l));
    }
    if (langBtn) {
      langBtn.setAttribute('aria-label', langBtn.getAttribute('data-label-' + l));
      langBtn.setAttribute('lang', l === 'zh' ? 'en' : 'zh-Hans');
    }
    var titled = doc.querySelectorAll('[data-title-' + l + ']');
    for (var i = 0; i < titled.length; i++) {
      titled[i].setAttribute('title', titled[i].getAttribute('data-title-' + l));
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      put('theme', next);
      paint();
    });
  }

  /* Follow the system theme while the visitor has not chosen one. */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mq) {
    var onSystem = function (e) {
      var stored = get('theme');
      if (stored !== 'dark' && stored !== 'light') { setTheme(e.matches ? 'dark' : 'light'); paint(); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystem);
    else if (mq.addListener) mq.addListener(onSystem);
  }

  /* A ?lang= parameter overrides the stored choice on load, so keep it in step with a switch. */
  function syncUrl(l) {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has('lang')) return;
      if (l === 'en') url.searchParams.delete('lang');
      else url.searchParams.set('lang', l);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// or an old browser: nothing to sync */ }
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var next = lang() === 'zh' ? 'en' : 'zh';
      applyLang(next);
      put('lang', next);
      syncUrl(next);
      paint();
    });
  }

  paint();

  /* News: the newest items stay visible; the button shows the rest in place. */
  var moreBtn = doc.getElementById('news-more');
  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      var list = doc.getElementById(moreBtn.getAttribute('aria-controls'));
      var open = moreBtn.getAttribute('aria-expanded') !== 'true';
      moreBtn.setAttribute('aria-expanded', String(open));
      if (list) list.classList.toggle('is-open', open);
    });
  }

  /* BibTeX: each <details> gets its trigger in the links row and a copy button. */
  var tpl = doc.getElementById('copy-button');
  var status = doc.getElementById('copy-status');
  var panels = doc.querySelectorAll('.pub__bib');
  for (var p = 0; p < panels.length; p++) {
    (function (panel) {
      var btn = doc.querySelector('.bib-btn[aria-controls="' + panel.id + '"]');
      if (btn) {
        panel.addEventListener('toggle', function () {
          btn.setAttribute('aria-expanded', String(panel.open));
        });
      }
      var body = panel.querySelector('.pub__bib-body');
      if (tpl && body && 'content' in tpl) {
        body.insertBefore(doc.importNode(tpl.content, true), body.firstChild);
      }
    })(panels[p]);
  }

  function announce(button) {
    if (!status) return;
    var done = button.querySelector('.copy-btn__done [data-lang-' + lang() + ']');
    status.textContent = '';
    window.setTimeout(function () { status.textContent = done ? done.textContent : ''; }, 50);
  }

  function copied(button) {
    button.classList.add('is-copied');
    announce(button);
    window.clearTimeout(button._reset);
    button._reset = window.setTimeout(function () {
      button.classList.remove('is-copied');
      if (status) status.textContent = '';
    }, 1500);
  }

  function copyFallback(button, pre) {
    var sel = window.getSelection();
    var range = doc.createRange();
    range.selectNodeContents(pre);
    sel.removeAllRanges();
    sel.addRange(range);
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    if (ok) { sel.removeAllRanges(); copied(button); }
    /* otherwise the entry stays selected, ready for Ctrl+C */
  }

  doc.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var bib = target.closest('.bib-btn');
    if (bib) {
      var panel = doc.getElementById(bib.getAttribute('aria-controls'));
      if (!panel) return;
      var open = bib.getAttribute('aria-expanded') !== 'true';
      bib.setAttribute('aria-expanded', String(open));
      panel.open = open;
      return;
    }

    var copy = target.closest('.copy-btn');
    if (copy) {
      var pre = copy.parentNode.querySelector('pre');
      if (!pre) return;
      var text = pre.textContent;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { copied(copy); }, function () { copyFallback(copy, pre); });
      } else {
        copyFallback(copy, pre);
      }
    }
  });

  /* Header links: underline the section being read. */
  var spyLinks = {};
  [].forEach.call(doc.querySelectorAll('.site-nav__links a[href^="#"]'), function (a) {
    spyLinks[a.getAttribute('href').slice(1)] = a;
  });
  var spyOwner = { 'more-publications': 'publications', honors: 'experience' };
  var spySections = [].slice.call(doc.querySelectorAll('main section[id]'));
  var spyQueued = false;
  var spyLock = null;   /* after a header click, keep that link marked until the reader scrolls by hand */
  Object.keys(spyLinks).forEach(function (id) {
    spyLinks[id].addEventListener('click', function () { spyLock = id; spy(); });
  });
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
    window.addEventListener(type, function () { spyLock = null; }, { passive: true });
  });
  var spy = function () {
    spyQueued = false;
    var line = window.scrollY + 120, cur = null, de = doc.documentElement;
    spySections.forEach(function (s) {
      if (s.getBoundingClientRect().top + window.scrollY <= line) cur = s.id;
    });
    if (window.innerHeight + window.scrollY >= de.scrollHeight - 2 && spySections.length) {
      cur = spySections[spySections.length - 1].id;
    }
    cur = spyLock || spyOwner[cur] || cur;
    Object.keys(spyLinks).forEach(function (id) {
      if (id === cur) spyLinks[id].setAttribute('aria-current', 'location');
      else spyLinks[id].removeAttribute('aria-current');
    });
  };
  if (spySections.length && Object.keys(spyLinks).length) {
    window.addEventListener('scroll', function () {
      if (!spyQueued) { spyQueued = true; window.requestAnimationFrame(spy); }
    }, { passive: true });
    window.addEventListener('resize', spy);
    spy();
  }
})();
