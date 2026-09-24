const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

// Firebase Admin Setup
const serviceAccount = require("../serviceAccountKey.json"); // আপনার ফায়ারবেস জেসন ফাইলের লোকেশন
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// Twilio Setup
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// JWT Secret Key (আপনার .env ফাইলে এটি অ্যাড করবেন)
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_jwt_key_123";

// ... (আপনার আগের Rate Limiter এবং Validation Helpers এখানে থাকবে) ...

router.post("/send-otp", async (req, res) => {
    // ... (আপনার আগের সেন্ড ওটিপি লজিক হুবহু থাকবে) ...
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "ফোন নম্বর বা ওটিপি কোড সঠিক নয়।" });
    }

    // Twilio OTP Verify
    const check = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status !== "approved") {
      return res.status(400).json({ error: "ওটিপি ভুল হয়েছে অথবা মেয়াদ শেষ হয়ে গেছে।" });
    }

    // Firestore Check
    const userRef = db.collection("users").doc(phone);
    const doc = await userRef.get();
    
    let isNewUser = false;

    if (!doc.exists) {
      // নতুন ইউজার হলে ডাটাবেসে সেভ করা হবে
      isNewUser = true;
      await userRef.set({
        name: "",
        open_date: admin.firestore.FieldValue.serverTimestamp(),
        balance: 0,
        mobile_number: phone
      });
    }

    // JWT Token Generate (৩০ দিনের জন্য ভ্যালিড)
    const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      verified: true,
      isNewUser,
      token,
      status: check.status
    });

  } catch (err) {
    console.error("[login/verify-otp Error]:", err.message);
    return res.status(500).json({ error: "সার্ভার এরর, আবার চেষ্টা করুন।" });
  }
});

module.exports = router;
