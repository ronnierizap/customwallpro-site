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

  /* ── Conversion tracking helpers ───────────────────────────────────────
     Google tag is loaded once in each page <head>. These helpers only send
     events after a completed action — never on page views or button clicks
     that didn't succeed. */
  const ADS_ID = 'AW-18362422859';
  const CONV = {
    quote:   ADS_ID + '/dLH-CIvzhoYdEMus8bNE', // Quote form submitted (Formspree accepted)
    contact: ADS_ID + '/6gCACMzKiokdEMus8bNE', // Contact form submitted (Formspree accepted)
    call:    ADS_ID + '/DNVsCJHzhoYdEMus8bNE', // Call button tap (tel: link)
    messenger: ADS_ID + '/IBI9CNq2mYkdEMus8bNE' // Messenger chat tap (m.me link)
    // $200 quote paid is fired from quote-confirmed.html only
  };
  const hasGtag = function () { return typeof window.gtag === 'function'; };

  /* Send an Ads conversion + GA4 event, then run `done` once the hit is sent
     (or after 1s max, so a blocked/slow tag never traps the visitor). */
  function trackConversion(sendTo, ga4Event, ga4Params, done) {
    let finished = false;
    const finish = function () { if (!finished) { finished = true; if (done) done(); } };
    if (!hasGtag()) { finish(); return; }
    window.gtag('event', ga4Event, Object.assign({ send_to: 'G-97DSR2QK1N' }, ga4Params || {}));
    window.gtag('event', 'conversion', { send_to: sendTo, event_callback: finish, event_timeout: 1000 });
    setTimeout(finish, 1100);
  }

  /* ── Floating "Message us" button → Custom Wall Pro Messenger ── */
  const MESSENGER_URL = 'https://m.me/1220423157828732';
  if (!document.querySelector('.msgr-fab')) {
    const css = document.createElement('style');
    css.textContent = '.msgr-fab{position:fixed;right:16px;bottom:16px;z-index:999;display:inline-flex;align-items:center;gap:.5rem;' +
      'padding:.8rem 1.1rem;border-radius:999px;background:#0866ff;color:#fff !important;font:600 .95rem/1 Inter,system-ui,sans-serif;' +
      'text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.35)}.msgr-fab:hover{background:#0654d6}' +
      '.msgr-fab svg{width:20px;height:20px;fill:#fff}';
    document.head.appendChild(css);
    const fab = document.createElement('a');
    fab.className = 'msgr-fab';
    fab.href = MESSENGER_URL;
    fab.target = '_blank';
    fab.rel = 'noopener';
    fab.setAttribute('aria-label', 'Message Custom Wall Pro on Messenger');
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.98-.87a.8.8 0 0 1 .53-.04c.91.25 1.87.38 2.91.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z"/></svg><span>Message us</span>';
    document.body.appendChild(fab);
  }

  /* ── Messenger taps / phone taps: one conversion each per page view;
        email taps: GA4 only ── */
  let callTracked = false, messengerTracked = false;
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"], a[href*="m.me/"]');
    if (!a) return;
    if (a.getAttribute('href').indexOf('m.me/') !== -1) {
      if (messengerTracked) return;
      messengerTracked = true;
      trackConversion(CONV.messenger, 'messenger_click', { page: page });
    } else if (a.getAttribute('href').indexOf('tel:') === 0) {
      if (callTracked) return;
      callTracked = true;
      trackConversion(CONV.call, 'click_to_call', { link_url: a.getAttribute('href'), page: page });
    } else if (hasGtag()) {
      window.gtag('event', 'email_click', { send_to: 'G-97DSR2QK1N', page: page });
    }
  });

  /* ── Quote Form Submit → Save Lead + Redirect to Stripe Payment Link ── */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    const STRIPE_QUOTE_LINK = 'https://buy.stripe.com/aFa00i5TH1MY1xQ6fE6EU00';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzjlove';
    let quoteSubmitting = false;

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (quoteSubmitting) return;
      /* Required fields must be filled before anything is sent or counted. */
      if (!quoteForm.checkValidity()) { quoteForm.reportValidity(); return; }
      quoteSubmitting = true;
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
         endpoint never blocks the redirect to Stripe. The conversion is
         counted ONLY when Formspree confirms the submission was accepted. */
      const save = fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(quoteForm)
      }).then(function (res) { return res.ok; })
        .catch(function () { return false; /* payment must still proceed */ });

      const timeout = new Promise(function (resolve) { setTimeout(function () { resolve(false); }, 2000); });

      Promise.race([save, timeout]).then(function (accepted) {
        if (accepted) {
          trackConversion(CONV.quote, 'generate_lead', { form_type: 'quote', project_type: type }, goToStripe);
        } else {
          goToStripe();
        }
      });
    });
  }

  /* ── Contact Form Submit → Formspree (same account as the quote form) ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const CONTACT_ENDPOINT = contactForm.getAttribute('action') || 'https://formspree.io/f/xvzjlove';
    const status = document.getElementById('contactStatus');
    let contactSubmitting = false;
    const showStatus = function (msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.style.display = 'block';
      status.style.color = ok ? '#7bd67b' : '#ff8a80';
    };

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (contactSubmitting) return;
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      contactSubmitting = true;
      const btn = contactForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm)
      }).then(function (res) {
        if (!res.ok) throw new Error('Formspree ' + res.status);
        const subject = contactForm.querySelector('#c-subject')?.value || '';
        trackConversion(CONV.contact, 'generate_lead', { form_type: 'contact', subject: subject });
        btn.textContent = 'Message Sent!';
        btn.style.background = '#2a6e2a';
        btn.style.color = '#fff';
        showStatus('Thanks — your message was sent. We reply within one business day.', true);
        contactForm.reset();
      }).catch(function () {
        contactSubmitting = false;
        btn.textContent = original;
        btn.disabled = false;
        showStatus('Sorry, your message didn’t send. Please call or text (250) 486-3409, or email customwallpro@gmail.com.', false);
      });
    });
  }
})();
