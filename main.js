/* ─── CUSTOM WALL PRO — SHARED JS ─────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Mobile Nav Toggle ── */
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    /* Close drawer on link click */
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside tap */
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Mark Active Nav Link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop() || 'index.html';
    if (href === page) a.classList.add('active');
  });

  /* ── Quote Form Submit (No Backend) ── */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = quoteForm.querySelector('[type="submit"]');
      btn.textContent = 'Sent — We\'ll be in touch!';
      btn.disabled = true;
      btn.style.background = '#2a6e2a';
      btn.style.color = '#fff';
    });
  }

  /* ── Contact Form Submit (No Backend) ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      btn.textContent = 'Message Received!';
      btn.disabled = true;
      btn.style.background = '#2a6e2a';
      btn.style.color = '#fff';
    });
  }
})();
