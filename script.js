
const API_BASE = "https://reacharge-app-backend.onrender.com"; // এখানে আপনার Render-এর লিংক বসাবেন
const RESEND_SECONDS = 24;

// ==========================================================================
// Elements
// ==========================================================================
const screenPhone = document.getElementById("screen-phone");
const screenOtp = document.getElementById("screen-otp");

const phoneForm = document.getElementById("phone-form");
const phoneInput = document.getElementById("phone-input");
const phoneError = document.getElementById("phone-error");
const sendOtpBtn = document.getElementById("send-otp-btn");

const backBtn = document.getElementById("back-btn");
const sentToNumber = document.getElementById("sent-to-number");
const otpRow = document.getElementById("otp-row");
const otpBoxes = Array.from(document.querySelectorAll(".otp-box"));
const otpError = document.getElementById("otp-error");
const verifyBtn = document.getElementById("verify-btn");

const resendBtn = document.getElementById("resend-btn");
const resendTimerEl = document.getElementById("resend-timer");
const resendStatic = document.getElementById("resend-static");

const keypad = document.getElementById("keypad");
const toast = document.getElementById("toast");

// ==========================================================================
// State
// ==========================================================================
let fullPhoneNumber = ""; // e.g. +919876543210
let resendInterval = null;
let activeOtpIndex = 0;
let otpAttempts = 0; // কতবার ওটিপি পাঠানো হলো তা ট্র্যাক করার জন্য

// ==========================================================================
// Helpers
// ==========================================================================
function showToast(message, type = "") {
  toast.textContent = message;
  toast.className = "toast show" + (type ? ` ${type}` : "");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("is-loading", isLoading);
  btn.disabled = isLoading;
}

function formatDisplayNumber(digits) {
  // 9876543210 -> 98765 43210
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function isValidIndianMobile(digits) {
  return /^[6-9]\d{9}$/.test(digits);
}

async function apiRequest(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* no-op: non-JSON response */
  }
  if (!res.ok) {
    const message = data && data.error ? data.error : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data;
}

// ==========================================================================
// Screen transition
// ==========================================================================
function goToScreen(screenEl) {
  [screenPhone, screenOtp].forEach((s) => {
    s.dataset.active = s === screenEl ? "true" : "false";
  });
}

// ==========================================================================
// Screen 1: Phone submit
// ==========================================================================
phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
  phoneError.textContent = "";
});

phoneForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const digits = phoneInput.value.trim();

  if (!isValidIndianMobile(digits)) {
    phoneError.textContent = "Enter a valid 10-digit mobile number";
    phoneInput.focus();
    return;
  }

  fullPhoneNumber = `+91${digits}`;
  setLoading(sendOtpBtn, true);

  try {
    // পাথ আপডেট করা হয়েছে
    await apiRequest("/api/login/send-otp", { phone: fullPhoneNumber });
    otpAttempts = 1; // প্রথমবার পাঠানো হলো
    sentToNumber.textContent = `+91 ${formatDisplayNumber(digits)}`;
    resetOtpBoxes();
    goToScreen(screenOtp);
    startResendTimer();
    setTimeout(() => otpBoxes[0].focus(), 420);
  } catch (err) {
    phoneError.textContent = err.message || "Could not send code. Please try again.";
  } finally {
    setLoading(sendOtpBtn, false);
  }
});

// ==========================================================================
// Screen 2: Back navigation
// ==========================================================================
backBtn.addEventListener("click", () => {
  stopResendTimer();
  goToScreen(screenPhone);
});

// ==========================================================================
// OTP boxes: auto-focus / backspace / paste logic
// ==========================================================================
function resetOtpBoxes() {
  otpBoxes.forEach((box) => {
    box.value = "";
    box.classList.remove("filled", "error");
  });
  activeOtpIndex = 0;
  updateVerifyState();
}

function getOtpValue() {
  return otpBoxes.map((b) => b.value).join("");
}

function updateVerifyState() {
  const complete = getOtpValue().length === 6;
  verifyBtn.disabled = !complete;
  return complete;
}

function focusBox(index) {
  const clamped = Math.max(0, Math.min(otpBoxes.length - 1, index));
  activeOtpIndex = clamped;
  otpBoxes[clamped].focus();
  otpBoxes[clamped].select();
}

otpBoxes.forEach((box, index) => {
  box.addEventListener("input", (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      box.value = "";
      box.classList.remove("filled");
      updateVerifyState();
      return;
    }
    box.value = val[val.length - 1]; // keep last typed digit
    box.classList.add("filled");
    box.classList.remove("error");
    otpError.textContent = "";

    if (index < otpBoxes.length - 1) {
      focusBox(index + 1);
    } else {
      box.blur();
    }
    updateVerifyState();
  });

  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (box.value) {
        box.value = "";
        box.classList.remove("filled");
        updateVerifyState();
      } else if (index > 0) {
        focusBox(index - 1);
        otpBoxes[index - 1].value = "";
        otpBoxes[index - 1].classList.remove("filled");
        updateVerifyState();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < otpBoxes.length - 1) {
      focusBox(index + 1);
      e.preventDefault();
    } else if (e.key === "Enter" && updateVerifyState()) {
      verifyOtp();
    }
  });

  box.addEventListener("focus", () => {
    activeOtpIndex = index;
    box.select();
  });

  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    pasted.split("").forEach((digit, i) => {
      if (otpBoxes[i]) {
        otpBoxes[i].value = digit;
        otpBoxes[i].classList.add("filled");
      }
    });
    const nextIndex = Math.min(pasted.length, otpBoxes.length - 1);
    focusBox(nextIndex);
    updateVerifyState();
  });
});

// ==========================================================================
// On-screen numeric keypad
// ==========================================================================
keypad.addEventListener("click", (e) => {
  const keyBtn = e.target.closest(".key");
  if (!keyBtn || keyBtn.classList.contains("key-empty")) return;
  const key = keyBtn.dataset.key;

  if (key === "del") {
    const box = otpBoxes[activeOtpIndex];
    if (box.value) {
      box.value = "";
      box.classList.remove("filled");
    } else if (activeOtpIndex > 0) {
      focusBox(activeOtpIndex - 1);
      otpBoxes[activeOtpIndex].value = "";
      otpBoxes[activeOtpIndex].classList.remove("filled");
    }
    updateVerifyState();
    return;
  }

  const box = otpBoxes[activeOtpIndex];
  box.value = key;
  box.classList.add("filled");
  box.classList.remove("error");
  otpError.textContent = "";

  if (activeOtpIndex < otpBoxes.length - 1) {
    focusBox(activeOtpIndex + 1);
  }
  updateVerifyState();
});

// ==========================================================================
// Resend timer
// ==========================================================================
function startResendTimer() {
  stopResendTimer();

  // যদি ইতিমধ্যে ২ বার পাঠানো হয়ে গিয়ে থাকে, তবে বাটন আর কখনোই সচল হবে না
  if (otpAttempts >= 2) {
    resendBtn.disabled = true;
    resendBtn.style.opacity = "0.5";
    resendBtn.textContent = "Limit reached";
    resendTimerEl.style.display = "none";
    resendStatic.style.display = "none";
    return;
  }

  let remaining = RESEND_SECONDS;
  resendTimerEl.textContent = `${remaining}s`;
  resendTimerEl.style.display = "inline";
  resendStatic.style.display = "inline";
  resendBtn.disabled = true;

  resendInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      stopResendTimer();
      resendTimerEl.style.display = "none";
      resendStatic.style.display = "none";
      resendBtn.disabled = false;
    } else {
      resendTimerEl.textContent = `${remaining}s`;
    }
  }, 1000);
}

function stopResendTimer() {
  if (resendInterval) {
    clearInterval(resendInterval);
    resendInterval = null;
  }
}

resendBtn.addEventListener("click", async () => {
  if (resendBtn.disabled || otpAttempts >= 2) return;
  resendBtn.disabled = true;
  try {
    // পাথ আপডেট করা হয়েছে
    await apiRequest("/api/login/send-otp", { phone: fullPhoneNumber });
    otpAttempts += 1; // দ্বিতীয়বার পাঠানো হলো
    showToast("A new code has been sent", "success");
    resetOtpBoxes();
    startResendTimer();
    focusBox(0);
  } catch (err) {
    showToast(err.message || "Could not resend code", "error");
    resendBtn.disabled = false;
  }
});

// ==========================================================================
// Verify OTP
// ==========================================================================
async function verifyOtp() {
  const code = getOtpValue();
  if (code.length !== 6) return;

  setLoading(verifyBtn, true);
  otpError.textContent = "";

  try {
    const data = await apiRequest("/api/login/verify-otp", { phone: fullPhoneNumber, code });
    
    if (data.verified) {
      showToast("Verified! Redirecting…", "success");
      
      // ব্রাউজারের লোকাল স্টোরেজে JWT টোকেন সেভ করা
      localStorage.setItem("authToken", data.token);

      // ইউজার স্ট্যাটাস অনুযায়ী পেজ রিডাইরেক্ট
      setTimeout(() => {
        if (data.isNewUser) {
          window.location.href = "/my-account.html"; // নতুন ইউজারের জন্য
        } else {
          window.location.href = "portal/index.html"; // আগে থেকে রেজিস্টার্ড ইউজারের জন্য
        }
      }, 1000);
      
    } else {
      throw new Error("Incorrect code. Please try again.");
    }
  } catch (err) {
    otpError.textContent = err.message || "Incorrect code. Please try again.";
    otpBoxes.forEach((b) => b.classList.add("error"));
    setTimeout(() => otpBoxes.forEach((b) => b.classList.remove("error")), 350);
    focusBox(0);
    otpBoxes.forEach((b) => (b.value = ""));
    otpBoxes.forEach((b) => b.classList.remove("filled"));
    updateVerifyState();
  } finally {
    setLoading(verifyBtn, false);
  }
}


verifyBtn.addEventListener("click", verifyOtp);
