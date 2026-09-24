(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  /* ---------- Image placeholders ----------
     Until real images are added, a neutral placeholder is shown
     instead of a broken image icon. Real logos replace it automatically
     once src points to a file that exists. */
  const FALLBACK_SRC = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' +
    '<rect width="96" height="96" rx="24" fill="#EFE9FF"/>' +
    '<circle cx="36" cy="37" r="6" fill="#B79BFF"/>' +
    '<path d="M24 68l17-19 12 13 8-9 11 15z" fill="#B79BFF"/></svg>'
  );

  function useFallback(img) {
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = FALLBACK_SRC;
  }

  $$('img').forEach((img) => {
    img.addEventListener('error', () => useFallback(img));
    if (img.complete && img.naturalWidth === 0) useFallback(img);
  });

  /* ---------- Tap ripple ---------- */
  document.addEventListener('pointerdown', (e) => {
    const host = e.target.closest('[data-ripple]');
    if (!host || host.disabled) return;

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const dot = document.createElement('span');

    dot.className = 'ripple' + (host.dataset.ripple === 'dark' ? ' ripple--dark' : '');
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = e.clientX - rect.left - size / 2 + 'px';
    dot.style.top = e.clientY - rect.top - size / 2 + 'px';

    host.appendChild(dot);
    setTimeout(() => dot.remove(), 650);
  });

  /* ---------- Placeholder actions ---------- */
  const ACTION_MESSAGES = {
    'add-money': 'Add Money will open here soon',
    'support':   'Support will open here soon',
    'offers':    'Offers will open here soon',
    'profile':   'Profile will open here soon'
  };

  $$('[data-action]').forEach((el) => {
    el.addEventListener('click', () => toast(ACTION_MESSAGES[el.dataset.action] || 'Coming soon'));
  });

  /* ---------- Bottom navigation: active tab ---------- */
  const navItems = $$('.nav__item');

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      // Links that still use href="#" only switch the active state.
      // Once you set a real href (e.g. "history.html") the browser navigates.
      if (item.getAttribute('href') === '#') e.preventDefault();

      navItems.forEach((other) => {
        other.classList.remove('is-active');
        other.removeAttribute('aria-current');
      });
      item.classList.add('is-active');
      item.setAttribute('aria-current', 'page');
    });
  });

  /* ---------- Hero banner dots ---------- */
  const track  = $('#heroTrack');
  const slides = $$('.slide', track);
  const dots   = $$('.hero__dot');

  function syncDots() {
    const step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    const index = Math.round(track.scrollLeft / step);
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  track.addEventListener('scroll', () => requestAnimationFrame(syncDots), { passive: true });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' }));
  });

  /* ---------- Wallet balance visibility ---------- */
  const balanceEl = $('#balanceValue');
  const eyeBtn    = $('#toggleBalance');

  eyeBtn.addEventListener('click', () => {
    const hide = eyeBtn.getAttribute('aria-pressed') !== 'true';
    eyeBtn.setAttribute('aria-pressed', String(hide));
    eyeBtn.setAttribute('aria-label', hide ? 'Show balance' : 'Hide balance');
    balanceEl.textContent = hide ? '₹ ••••••' : balanceEl.dataset.value;
  });

  /* ---------- Recharge: number + operator ---------- */
  const field    = $('#numberField');
  const input    = $('#mobileNumber');
  const hint     = $('#numberHint');
  const contBtn  = $('#continueBtn');
  const contText = $('#continueLabel');
  const ops      = $$('.op');

  const VALID_NUMBER = /^[6-9]\d{9}$/;
  let selectedOperator = null;

  // Add the selection tick to every operator tile
  ops.forEach((op) => {
    op.insertAdjacentHTML(
      'beforeend',
      '<span class="op__tick"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>'
    );
  });

  function setHint(text, state) {
    hint.textContent = text;
    hint.className = 'field__hint' + (state ? ' is-' + state : '');
  }

  function shake() {
    field.classList.remove('is-error');
    void field.offsetWidth; // restart the animation
    field.classList.add('is-error');
  }

  function refresh({ blurred = false } = {}) {
    const value = input.value;
    const valid = VALID_NUMBER.test(value);

    field.classList.toggle('is-filled', value.length > 0);
    field.classList.toggle('is-valid', valid);
    field.classList.remove('is-error');

    if (valid) {
      setHint('Number looks good', 'ok');
    } else if (value.length === 10) {
      setHint('Mobile numbers start with 6, 7, 8 or 9', 'error');
      field.classList.add('is-error');
    } else if (value.length > 0 && blurred) {
      setHint('Enter all 10 digits', 'error');
      shake();
    } else if (value.length > 0) {
      setHint(value.length + ' of 10 digits entered');
    } else {
      setHint('Enter a 10-digit mobile number');
    }

    if (!valid) contText.textContent = 'Enter mobile number';
    else if (!selectedOperator) contText.textContent = 'Select a service provider';
    else contText.textContent = 'Continue';

    contBtn.disabled = !(valid && selectedOperator);
  }

  input.addEventListener('input', (e) => {
    let digits = input.value.replace(/\D/g, '');

    // Pasted numbers often include +91 or a leading 0
    if (e.inputType === 'insertFromPaste' && digits.length > 10) {
      digits = digits.replace(/^(91|0)/, '');
    }

    input.value = digits.slice(0, 10);
    refresh();
  });

  input.addEventListener('blur', () => refresh({ blurred: true }));

  ops.forEach((op) => {
    op.addEventListener('click', () => {
      const wasSelected = op.getAttribute('aria-pressed') === 'true';

      ops.forEach((other) => other.setAttribute('aria-pressed', 'false'));
      selectedOperator = wasSelected ? null : op.dataset.operator;
      op.setAttribute('aria-pressed', String(!wasSelected));

      refresh();
    });
  });

  contBtn.addEventListener('click', () => {
    toast('Plans for ' + selectedOperator + ' will open here soon');
  });

  refresh();
  
    /* ---------- Fetch Dashboard Data (Name & Balance) ---------- */
  async function fetchDashboardData() {
    // HTML এর এলিমেন্টগুলো সিলেক্ট করা
    const userNameEl = $('#userName') || document.querySelector('.greeting__name');
    const balanceEl = $('#balanceValue');
    
    const token = localStorage.getItem('authToken');

    if (!token) {
      // টোকেন না থাকলে লগইন পেজে পাঠিয়ে দিতে পারেন
      window.location.href = '../index.html'; 
      return;
    }

    try {
      const response = await fetch('https://reacharge-app-backend.onrender.com/api/dashboard/user-info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      
      // নাম এবং ব্যালেন্স আপডেট করা
      if (userNameEl) userNameEl.textContent = data.name;
      if (balanceEl) {
        // ব্যালেন্স ২ ডেসিমেল পয়েন্টে দেখানো (যেমন: 200.00)
        balanceEl.dataset.value = `₹ ${parseFloat(data.balance).toFixed(2)}`;
        
        // ব্যালেন্স হাইড করা না থাকলে সাথে সাথে আপডেট দেখানো
        const eyeBtn = $('#toggleBalance');
        const isHidden = eyeBtn && eyeBtn.getAttribute('aria-pressed') === 'true';
        if (!isHidden) {
          balanceEl.textContent = balanceEl.dataset.value;
        }
      }

    } catch (error) {
      console.error('Error:', error);
      if (userNameEl) userNameEl.textContent = 'Valued Customer';
    }
  }

  // পেজ লোড হওয়ার সাথে সাথে ডেটা ফেচ করা হবে
  document.addEventListener('DOMContentLoaded', fetchDashboardData);

})();

//page com