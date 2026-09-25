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
    const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`;
    
    // লোকাল স্টোরেজ থেকে ফোন নম্বর নেওয়া
    const phone = localStorage.getItem("userPhone");
    
    if (!phone) {
      alert("Mobile number not found. Please login again.");
      window.location.href = "/index.html";
      return;
    }

    // ব্যাকএন্ডে পাঠানোর জন্য ডেটা রেডি করা (ফোন নম্বর সহ)
    const profileData = {
      phone: phone,
      name: fullName,
      email: emailValue
    };

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // সাকসেস হলে
      submitBtn.classList.remove("btn-loading");
      submitBtn.classList.add("btn-success");
      submitBtn.innerHTML = "Success!"; 
      successBox.classList.add("show");

      setTimeout(() => {
        window.location.href = "/portal/index.html";
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // ফেইল হলে
      submitBtn.classList.remove("btn-loading");
      submitBtn.classList.add("btn-error");
      submitBtn.innerHTML = "Failed!"; 
      
      setTimeout(() => {
        submitBtn.classList.remove("btn-error");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 3000);
    }
  }

});
