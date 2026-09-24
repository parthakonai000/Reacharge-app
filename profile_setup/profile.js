const form = document.getElementById("profileForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");

const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const emailError = document.getElementById("emailError");

const successBox = document.getElementById("successBox");
const submitBtn = form.querySelector('button[type="submit"]');

// আপনার Render-এর ব্যাকএন্ড লিংক এখানে বসান
const API_BASE = "https://your-render-app-name.onrender.com"; 

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // আগের এরর মেসেজগুলো ক্লিয়ার করা হচ্ছে
  firstNameError.textContent = "";
  lastNameError.textContent = "";
  emailError.textContent = "";

  let valid = true;

  // First Name ভ্যালিডেশন
  if (firstName.value.trim() === "") {
    firstNameError.textContent = "Please enter your first name.";
    valid = false;
  }

  // Last Name ভ্যালিডেশন
  if (lastName.value.trim() === "") {
    lastNameError.textContent = "Please enter your last name.";
    valid = false;
  }

  // Email ভ্যালিডেশন
  const emailValue = email.value.trim();
  if (emailValue === "") {
    emailError.textContent = "Please enter your email address.";
    valid = false;
  } else if (!emailValue.includes("@")) {
    emailError.textContent = "Please enter a valid email address.";
    valid = false;
  }

  // যদি সবকিছু ঠিক থাকে
  if (valid) {
    // ফার্স্ট নেম এবং লাস্ট নেম এর মাঝে স্পেস দিয়ে যুক্ত করা হলো
    const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`;
    
    const profileData = {
      name: fullName,
      email: emailValue
    };

    // লোকাল স্টোরেজ থেকে লগইনের সময় সেভ করা টোকেন নেওয়া
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      alert("Authentication error. Please login again.");
      window.location.href = "/index.html"; 
      return;
    }

    // ১. লোডিং স্টেট চালু করা
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    try {
      // ব্যাকএন্ডে ডেটা পাঠানো
      const res = await fetch(`${API_BASE}/api/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // ২. সাকসেস স্টেট দেখানো
      submitBtn.classList.remove("btn-loading");
      submitBtn.classList.add("btn-success");
      submitBtn.innerHTML = "Success!"; 
      successBox.classList.add("show");

      // সাকসেস হওয়ার ১.৫ সেকেন্ড পর পোর্টালে রিডাইরেক্ট করবে
      setTimeout(() => {
        window.location.href = "/portal/index.html";
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // ৩. ফেইলড স্টেট দেখানো
      submitBtn.classList.remove("btn-loading");
      submitBtn.classList.add("btn-error");
      submitBtn.innerHTML = "Failed!"; 
      
      // ৩ সেকেন্ড পর বাটনটি আগের অবস্থায় ফিরিয়ে আনা
      setTimeout(() => {
        submitBtn.classList.remove("btn-error");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 3000);
    }
  }
});
