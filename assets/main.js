// ============================================================
// GLOBAL SMILE CARE — Shared JavaScript + i18n Engine
// ============================================================

// ── i18n Engine ────────────────────────────────────────────
const I18N = {
  lang: 'en',

  init() {
    // Read stored preference, default = 'en'
    this.lang = localStorage.getItem('gsc_lang') || 'en';
    this.apply(this.lang);
    this.bindSwitcher();
  },

  t(key) {
    const dict = window.GSC_TRANSLATIONS?.[this.lang] || {};
    return dict[key] ?? key;
  },

  apply(lang) {
    this.lang = lang;
    localStorage.setItem('gsc_lang', lang);
    document.documentElement.lang = lang;

    // Update page <title> and meta description
    const pageKey = document.body.dataset.page;
    if (pageKey) {
      const titleKey = `page.${pageKey}.title`;
      const metaKey  = `page.${pageKey}.meta`;
      const title    = this.t(titleKey);
      const meta     = this.t(metaKey);
      if (title !== titleKey) document.title = title;
      const metaEl = document.querySelector('meta[name="description"]');
      if (metaEl && meta !== metaKey) metaEl.setAttribute('content', meta);
    }

    // Update all [data-i18n] elements (text content)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });

    // Update all [data-i18n-html] elements (inner HTML, supports <br/> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      el.innerHTML = this.t(key);
    });

    // Update all [data-i18n-placeholder] elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.t(key);
    });

    // Update language switcher button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  },

  bindSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang !== this.lang) {
          this.apply(btn.dataset.lang);
        }
      });
    });
  }
};

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Init i18n (must run before other UI code)
  I18N.init();

  // ── Mobile hamburger ──────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ── Scroll reveal ─────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── FAQ accordion ─────────────────────────────────────────
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Treatment / journal filter pills ─────────────────────
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      document.querySelectorAll('[data-category]').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });

  // ── Count-up animation on stats ──────────────────────────
  const countEls = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target   = parseFloat(el.dataset.count);
        const suffix   = el.dataset.suffix || '';
        const duration = 1200;
        const start    = Date.now();
        const tick = () => {
          const elapsed  = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  countEls.forEach(el => countObserver.observe(el));

  // ── Navbar background on scroll ──────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.background = window.scrollY > 40
        ? 'rgba(13,14,14,0.97)'
        : 'rgba(19,19,20,0.88)';
    }, { passive: true });
  }

  // ── Active nav link (by current filename) ────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

});
