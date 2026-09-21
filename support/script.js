/* ==========================================================
   MY RECHARGE APP — SUPPORT PAGE
   Ripple effect for buttons + navigation
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const rippleElements = document.querySelectorAll("[data-ripple]");


  rippleElements.forEach((element) => {

    element.addEventListener("click", function (event) {

      /* Remove previous ripple */
      const oldRipple = this.querySelector(".ripple");

      if (oldRipple) {
        oldRipple.remove();
      }


      /* Create ripple */
      const ripple = document.createElement("span");

      ripple.className = "ripple";


      /* Get click position */
      const rect = this.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;


      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;


      /*
       * Navigation gets a violet ripple because
       * the navigation itself is violet.
       */
      if (this.classList.contains("nav__item")) {
        ripple.classList.add("ripple--dark");
      }


      this.appendChild(ripple);


      /* Remove after animation */
      ripple.addEventListener("animationend", () => {
        ripple.remove();
      });

    });

  });

});