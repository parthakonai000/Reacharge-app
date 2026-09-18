(function () {
  "use strict";

  /* ---------------------------------------------------
     Element references
  --------------------------------------------------- */
  const mobileInput   = document.getElementById("mobileNumber");
  const inputShell     = document.getElementById("inputShell");
  const fieldHint       = document.getElementById("fieldHint");
  const detectedRow     = document.getElementById("detectedRow");
  const detectedText    = document.getElementById("detectedText");
  const contactsBtn     = document.getElementById("contactsBtn");

  const operatorGrid    = document.getElementById("operatorGrid");
  const operatorCards   = Array.from(document.querySelectorAll(".operator-card"));

  const amountChips     = Array.from(document.querySelectorAll(".amount-chip"));
  const amountInput     = document.getElementById("amountInput");

  const ctaAmount       = document.getElementById("ctaAmount");
  const rechargeBtn     = document.getElementById("rechargeBtn");

  const toast           = document.getElementById("toast");
  const toastText        = document.getElementById("toastText");

  const bannerTrack      = document.getElementById("bannerTrack");
  const bannerDotsWrap   = document.getElementById("bannerDots");

  const balanceEyeBtn    = document.getElementById("balanceEyeBtn");
  const balanceAmount    = document.getElementById("balanceAmount");

  /* ---------------------------------------------------
     State
  --------------------------------------------------- */
  let selectedOperator = null;
  let selectedAmount = null;
  let autoDetected = false;

  /* ---------------------------------------------------
     Demo prefix -> operator map (illustrative only)
  --------------------------------------------------- */
  const PREFIX_MAP = {
    "6": "Jio",
    "7": "Airtel",
    "8": "Vi",
    "9": "BSNL"
  };

  /* =====================================================
     Mobile number input
  ===================================================== */

  mobileInput.addEventListener("input", () => {
    // keep digits only, cap at 10
    const digitsOnly = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    mobileInput.value = digitsOnly;

    updateHint(digitsOnly);
    updateCta();

    if (digitsOnly.length >= 2 && !selectedOperator) {
      tryAutoDetect(digitsOnly);
    }
    if (digitsOnly.length === 0) {
      autoDetected = false;
      detectedRow.hidden = true;
      clearOperatorSelection();
    }
  });

  mobileInput.addEventListener("blur", () => {
    const digits = mobileInput.value;
    if (digits.length > 0 && digits.length < 10) {
      inputShell.classList.add("shake");
      setTimeout(() => inputShell.classList.remove("shake"), 400);
    }
  });

  function updateHint(digits) {
    fieldHint.classList.remove("is-valid", "is-error");
    if (digits.length === 0) {
      fieldHint.textContent = "We'll detect your operator and circle automatically";
    } else if (digits.length < 10) {
      fieldHint.textContent = `${10 - digits.length} digit${10 - digits.length === 1 ? "" : "s"} remaining`;
    } else {
      fieldHint.textContent = "Looks good";
      fieldHint.classList.add("is-valid");
    }
  }

  function tryAutoDetect(digits) {
    const operator = PREFIX_MAP[digits[0]];
    if (!operator) return;

    autoDetected = true;
    detectedText.textContent = `Detected: ${operator} · West Bengal`;
    detectedRow.hidden = false;
    selectOperator(operator, { silent: true });
  }

  /* =====================================================
     My Balance — show / hide toggle
  ===================================================== */

  balanceEyeBtn.addEventListener("click", () => {
    const nowHidden = balanceAmount.classList.toggle("is-hidden");
    balanceEyeBtn.setAttribute("aria-label", nowHidden ? "Show balance" : "Hide balance");
  });

  /* =====================================================
     Contacts button (placeholder action)
  ===================================================== */

  contactsBtn.addEventListener("click", () => {
    contactsBtn.style.transform = "scale(0.85)";
    setTimeout(() => (contactsBtn.style.transform = ""), 150);
    showToast("Contact picker connects when this app is wrapped natively");
  });

  /* =====================================================
     Operator selection grid
  ===================================================== */

  operatorCards.forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.operator;
      autoDetected = false;
      detectedRow.hidden = true;
      selectOperator(name);
    });
  });

  function selectOperator(name, opts) {
    selectedOperator = name;
    operatorCards.forEach((card) => {
      const isMatch = card.dataset.operator === name;
      card.classList.toggle("is-selected", isMatch);
    });
    updateCta();
    if (!opts || !opts.silent) {
      pulse(operatorGrid);
    }
  }

  function clearOperatorSelection() {
    selectedOperator = null;
    operatorCards.forEach((card) => card.classList.remove("is-selected"));
    updateCta();
  }

  /* =====================================================
     Amount chips + custom input
  ===================================================== */

  amountChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = Number(chip.dataset.amount);
      setAmount(value);
      amountInput.value = "";
    });
  });

  amountInput.addEventListener("input", () => {
    const raw = amountInput.value.replace(/[^\d]/g, "");
    amountInput.value = raw;
    amountChips.forEach((chip) => chip.classList.remove("is-active"));
    setAmount(raw ? Number(raw) : null);
  });

  function setAmount(value) {
    selectedAmount = value;
    amountChips.forEach((chip) => {
      chip.classList.toggle("is-active", Number(chip.dataset.amount) === value);
    });
    ctaAmount.textContent = `₹${value ? value : 0}`;
    updateCta();
  }

  /* =====================================================
     CTA state + submission
  ===================================================== */

  function updateCta() {
    const numberValid = mobileInput.value.length === 10;
    const amountValid = Boolean(selectedAmount && selectedAmount > 0);
    const ready = numberValid && amountValid;
    rechargeBtn.disabled = !ready;
  }

  rechargeBtn.addEventListener("click", () => {
    if (rechargeBtn.disabled || rechargeBtn.classList.contains("is-loading")) return;

    rechargeBtn.classList.add("is-loading");

    setTimeout(() => {
      rechargeBtn.classList.remove("is-loading");
      const operatorLabel = selectedOperator ? selectedOperator : "your operator";
      showToast(`₹${selectedAmount} sent to ${operatorLabel} recharge`);
    }, 1400);
  });

  /* =====================================================
     Toast helper
  ===================================================== */

  let toastTimer = null;

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* =====================================================
     Small pulse feedback for grid changes
  ===================================================== */

  function pulse(el) {
    el.style.transition = "transform 0.18s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "scale(0.99)";
    requestAnimationFrame(() => {
      el.style.transform = "scale(1)";
    });
  }

  /* =====================================================
     Banner carousel dots (syncs with native scroll-snap)
  ===================================================== */

  function initBannerDots() {
    const banners = Array.from(bannerTrack.children);
    banners.forEach((_, i) => {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      bannerDotsWrap.appendChild(dot);
    });

    const dots = Array.from(bannerDotsWrap.children);

    let ticking = false;
    bannerTrack.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const index = Math.round(bannerTrack.scrollLeft / bannerTrack.clientWidth);
        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
        ticking = false;
      });
    });
  }

  initBannerDots();

  /* Initial state */
  updateCta();
})();
