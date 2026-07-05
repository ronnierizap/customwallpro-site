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

  /* ── Quote Form Submit → Save Lead + Redirect to Stripe Payment Link ── */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    const STRIPE_QUOTE_LINK = 'https://buy.stripe.com/aFa00i5TH1MY1xQ6fE6EU00';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzjlove';

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = quoteForm.querySelector('[type="submit"]');

      const name = (quoteForm.querySelector('#q-name')?.value || '').trim();
      const phone = (quoteForm.querySelector('#q-phone')?.value || '').trim();
      const email = (quoteForm.querySelector('#q-email')?.value || '').trim();
      const type = quoteForm.querySelector('#q-type')?.selectedOptions?.[0]?.textContent?.trim() || '';
      const details = (quoteForm.querySelector('#q-details')?.value || '').trim();

      /* Stripe Payment Links can't accept custom structured fields, so we
         pack what fits into client_reference_id (200 char limit) and use
         prefilled_email for the checkout email field — this is the only
         data that survives the handoff without a backend. */
      let ref = [name, phone, type, details].filter(Boolean).join(' | ');
      if (ref.length > 190) ref = ref.slice(0, 187) + '...';

      const url = new URL(STRIPE_QUOTE_LINK);
      if (ref) url.searchParams.set('client_reference_id', ref);
      if (email) url.searchParams.set('prefilled_email', email);

      btn.textContent = 'Sending...';
      btn.disabled = true;

      const goToStripe = function () {
        btn.textContent = 'Redirecting to payment...';
        btn.style.background = '#2a6e2a';
        btn.style.color = '#fff';
        setTimeout(function () {
          window.location.href = url.toString();
        }, 900);
      };

      /* Save the lead to Formspree so it isn't lost if the customer never
         completes payment. Race against a timeout so a slow/unreachable
         endpoint never blocks the redirect to Stripe. */
      const save = fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(quoteForm)
      }).catch(function () { /* ignore — payment must still proceed */ });

      const timeout = new Promise(function (resolve) { setTimeout(resolve, 2000); });

      Promise.race([save, timeout]).then(goToStripe);
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
