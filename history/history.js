/* ==========================================================
   MY RECHARGE APP — HISTORY
   Frontend demo data.
   
   Later, replace this array with your backend/API response.
   ========================================================== */

"use strict";


/*
 * ==========================================================
 * DEMO TRANSACTION DATA
 * ==========================================================
 *
 * type:
 *   recharge
 *   payment
 *   add-money
 *
 * status:
 *   success
 *   pending
 *   failed
 *
 * amount:
 *   Transaction amount
 */

const transactions = [

  {
    id: "TXN10001",
    type: "recharge",
    title: "Mobile Recharge",
    number: "91234 56789",
    amount: 299,
    status: "success",
    date: "21 Sep 2026",
    time: "04:25 PM"
  },

  {
    id: "TXN10002",
    type: "payment",
    title: "Bill Payment",
    number: "Electricity Bill",
    amount: 399,
    status: "success",
    date: "20 Sep 2026",
    time: "08:12 PM"
  },

  {
    id: "TXN10003",
    type: "add-money",
    title: "Money Added",
    number: "Recharge Wallet",
    amount: 500,
    status: "success",
    date: "19 Sep 2026",
    time: "01:45 PM"
  },

  {
    id: "TXN10004",
    type: "recharge",
    title: "Mobile Recharge",
    number: "8888 777 666",
    amount: 399,
    status: "pending",
    date: "18 Sep 2026",
    time: "06:30 PM"
  },

  {
    id: "TXN10005",
    type: "recharge",
    title: "Mobile Recharge",
    number: "98765 43210",
    amount: 599,
    status: "failed",
    date: "17 Sep 2026",
    time: "11:18 AM"
  },

  {
    id: "TXN10006",
    type: "payment",
    title: "DTH Recharge",
    number: "TATA Play",
    amount: 299,
    status: "success",
    date: "16 Sep 2026",
    time: "09:05 PM"
  },

  {
    id: "TXN10007",
    type: "add-money",
    title: "Money Added",
    number: "Recharge Wallet",
    amount: 1000,
    status: "success",
    date: "15 Sep 2026",
    time: "02:20 PM"
  }

];


let currentFilter = "all";

let searchQuery = "";

let newestFirst = true;


/* ==========================================================
   DOM ELEMENTS
   ========================================================== */

const historyList =
  document.getElementById("historyList");

const emptyHistory =
  document.getElementById("emptyHistory");

const searchInput =
  document.getElementById("historySearch");

const searchClear =
  document.getElementById("searchClear");

const filterButtons =
  document.querySelectorAll(".filter-btn");

const totalTransactions =
  document.getElementById("totalTransactions");

const successfulTransactions =
  document.getElementById("successfulTransactions");

const resultText =
  document.getElementById("resultText");

const sortButton =
  document.getElementById("sortButton");

const clearSearch =
  document.getElementById("clearSearch");


/* ==========================================================
   ICONS
   ========================================================== */

function getTransactionIcon(type) {

  if (type === "recharge") {

    return `
      <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14v-2a8 8 0 0116 0v2"/>
        <rect x="3" y="14" width="4.5" height="6" rx="2"/>
        <rect x="16.5" y="14" width="4.5" height="6" rx="2"/>
        <path d="M19 20c0 1.2-1.5 2-4 2h-2"/>
      </svg>
    `;
  }


  if (type === "payment") {

    return `
      <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3"/>
        <path d="M3 10h18"/>
        <path d="M7 15h4"/>
      </svg>
    `;
  }


  return `
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14"/>
      <path d="M7 10l5-5 5 5"/>
      <rect x="4" y="4" width="16" height="16" rx="4"/>
    </svg>
  `;
}


/* ==========================================================
   STATUS
   ========================================================== */

function getStatusLabel(status) {

  if (status === "success") {
    return "Successful";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Failed";
}


/* ==========================================================
   FILTER + SEARCH
   ========================================================== */

function getFilteredTransactions() {

  let result = [...transactions];


  /*
   * Category filter
   */
  if (currentFilter !== "all") {

    result = result.filter(
      item => item.type === currentFilter
    );

  }


  /*
   * Search
   */
  if (searchQuery.trim() !== "") {

    const query =
      searchQuery
        .toLowerCase()
        .trim();


    result = result.filter(item => {

      const searchableText = [
        item.id,
        item.title,
        item.number,
        item.amount,
        item.status,
        item.date
      ]
        .join(" ")
        .toLowerCase();


      return searchableText.includes(query);

    });

  }


  /*
   * Sort
   */
  if (!newestFirst) {

    result.reverse();

  }


  return result;
}


/* ==========================================================
   RENDER HISTORY
   ========================================================== */

function renderHistory() {

  const filtered =
    getFilteredTransactions();


  historyList.innerHTML = "";


  /*
   * No result
   */
  if (filtered.length === 0) {

    historyList.style.display = "none";

    emptyHistory.hidden = false;

    resultText.textContent =
      searchQuery
        ? "No matching transactions"
        : "No transactions available";

    return;
  }


  /*
   * Results available
   */
  historyList.style.display = "flex";

  emptyHistory.hidden = true;


  resultText.textContent =
    `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;


  filtered.forEach(transaction => {

    const item =
      document.createElement("article");


    item.className =
      `transaction transaction--${transaction.type}`;


    const amountPrefix =
      transaction.type === "add-money"
        ? "+"
        : "-";


    const amountClass =
      transaction.type === "add-money"
        ? "transaction__amount--plus"
        : "transaction__amount--minus";


    item.innerHTML = `

      <div class="transaction__icon">
        ${getTransactionIcon(transaction.type)}
      </div>


      <div class="transaction__details">

        <div class="transaction__title">

          <span>${transaction.title}</span>

        </div>


        <div class="transaction__number">
          ${transaction.number}
        </div>


        <div class="transaction__date">
          ${transaction.date} • ${transaction.time}
        </div>

      </div>


      <div class="transaction__right">

        <div class="transaction__amount ${amountClass}">
          ${amountPrefix}₹${transaction.amount}
        </div>

        <span class="status status--${transaction.status}">
          ${getStatusLabel(transaction.status)}
        </span>

      </div>

    `;


    historyList.appendChild(item);

  });

}


/* ==========================================================
   SUMMARY
   ========================================================== */

function updateSummary() {

  totalTransactions.textContent =
    transactions.length;


  const successful =
    transactions.filter(
      item => item.status === "success"
    ).length;


  successfulTransactions.textContent =
    successful;
}


/* ==========================================================
   FILTER BUTTONS
   ========================================================== */

filterButtons.forEach(button => {

  button.addEventListener("click", () => {

    filterButtons.forEach(btn => {
      btn.classList.remove("is-active");
    });


    button.classList.add("is-active");


    currentFilter =
      button.dataset.filter;


    renderHistory();

  });

});


/* ==========================================================
   SEARCH
   ========================================================== */

searchInput.addEventListener("input", () => {

  searchQuery =
    searchInput.value;


  if (searchQuery.length > 0) {

    searchClear.classList.add("is-visible");

  } else {

    searchClear.classList.remove("is-visible");

  }


  renderHistory();

});


/*
 * Search clear button
 */
searchClear.addEventListener("click", () => {

  searchInput.value = "";

  searchQuery = "";

  searchClear.classList.remove("is-visible");

  searchInput.focus();

  renderHistory();

});


/*
 * Header clear button
 */
clearSearch.addEventListener("click", () => {

  searchInput.value = "";

  searchQuery = "";

  searchClear.classList.remove("is-visible");

  renderHistory();

});


/* ==========================================================
   SORT
   ========================================================== */

sortButton.addEventListener("click", () => {

  newestFirst =
    !newestFirst;


  renderHistory();

});


/* ==========================================================
   RIPPLE EFFECT
   ========================================================== */

document
  .querySelectorAll("[data-ripple]")
  .forEach(element => {

    element.addEventListener("click", function(event) {

      const oldRipple =
        this.querySelector(".ripple");


      if (oldRipple) {
        oldRipple.remove();
      }


      const ripple =
        document.createElement("span");


      ripple.className =
        "ripple";


      const rect =
        this.getBoundingClientRect();


      const x =
        event.clientX - rect.left;


      const y =
        event.clientY - rect.top;


      ripple.style.left =
        `${x}px`;


      ripple.style.top =
        `${y}px`;


      this.appendChild(ripple);


      ripple.addEventListener(
        "animationend",
        () => ripple.remove()
      );

    });

  });


/* ==========================================================
   INITIALIZE
   ========================================================== */

updateSummary();

renderHistory();

