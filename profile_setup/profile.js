const form = document.getElementById("profileForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");

const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const emailError = document.getElementById("emailError");

const successBox = document.getElementById("successBox");

// আপনার Render-এর ব্যাকএন্ড লিংক বসান
const API_BASE = "https://reacharge-app-backend.onrender.com"; 

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Clear previous errors
  firstNameError.textContent = "";
  lastNameError.textContent = "";
  emailError.textContent = "";

  let valid = true;

  // First Name
  if (firstName.value.trim() === "") {
    firstNameError.textContent = "Please enter your first name.";
    valid = false;
  }

  // Last Name
  if (lastName.value.trim() === "") {
    lastNameError.textContent = "Please enter your last name.";
    valid = false;
  }

  // Email
  const emailValue = email.value.trim();
  if (emailValue === "") {
    emailError.textContent = "Please enter your email address.";
    valid = false;
  } else if (!emailValue.includes("@")) {
    emailError.textContent = "Please enter a valid email address.";
    valid = false;
  }

  // If everything is valid
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
      window.location.href = "/index.html"; // টোকেন না থাকলে লগইনে পাঠাবে
      return;
    }

    try {
      // ব্যাকএন্ডে ডেটা পাঠানো
      const res = await fetch(`${API_BASE}/api/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // হেডারে টোকেন পাঠানো হলো
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      console.log("Profile Data Saved:", data);
      successBox.classList.add("show");

      // সাকসেস হওয়ার ১.৫ সেকেন্ড পর পোর্টালে রিডাইরেক্ট করবে
      setTimeout(() => {
        window.location.href = "/portal/index.html";
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message);
    }
  }
});
