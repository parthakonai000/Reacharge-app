document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');

    // ১. যদি টোকেন না থাকে, তার মানে ইউজার লগইন করেনি, তাই লগইন পেজে পাঠিয়ে দেবে
    if (!token) {
        window.location.href = '../index.html'; 
        return;
    }

    try {
        // আপনার Render-এর আসল API লিংকটি এখানে দিন
        const API_BASE = "https://reacharge-app-backend.onrender.com"; 

        // ২. ব্যাকএন্ড থেকে ইউজারের ইনফরমেশন ফেচ করা
        const response = await fetch(`${API_BASE}/api/dashboard/user-info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        // ৩. যদি ইউজারের নাম না থাকে বা ফাঁকা থাকে, তবে প্রোফাইল সেটআপ পেজে রিডাইরেক্ট করবে
        // (আগের কোডে আমরা নাম না পেলে ডিফল্ট "Customer" পাঠিয়েছিলাম, সেটাও চেক করা হচ্ছে)
        if (!data.name || data.name.trim() === "" || data.name === "Customer") {
            
            // এখানে আপনার প্রোফাইল সেটআপ পেজের সঠিক পাথ দিন (যেমন: '../profile.html' বা '../my-account.html')
            window.location.href = '../profile_setup/profile.html'; 
        }

    } catch (error) {
        console.error('Profile check error:', error);
        // কোনো বড় এরর হলে সিকিউরিটির জন্য লগইনে পাঠিয়ে দিতে পারেন
        // localStorage.removeItem('authToken');
        // window.location.href = '../index.html';
    }
});
