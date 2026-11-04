
// ===================================
// EXPENSE TRACKER - MAIN JAVASCRIPT
// ===================================

// Load saved transactions
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


// ===================================
// HTML ELEMENTS
// ===================================

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("totalIncome");
const expenseElement = document.getElementById("totalExpense");

const transactionList = document.getElementById("transactionList");

const addIncomeBtn = document.getElementById("addIncomeBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");


// ===================================
// CURRENCY FORMAT
// ===================================

function formatMoney(amount) {
    return "Rs. " + amount.toLocaleString("en-PK");
}


// ===================================
// SAVE DATA
// ===================================

function saveTransactions() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ===================================
// ADD TRANSACTION FORM
// ===================================

const dialog = document.createElement("dialog");

dialog.className = "transaction-dialog";

dialog.innerHTML = `
    <form id="transactionForm">

        <h2 id="formTitle">Add Transaction</h2>

        <label>Title</label>
        <input
            type="text"
            id="transactionTitle"
            placeholder="Enter title"
            required
        >

        <label>Amount (Rs.)</label>
        <input
            type="number"
            id="transactionAmount"
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            required
        >

        <label>Category</label>
        <select id="transactionCategory">
            <option value="shopping">Shopping</option>
            <option value="salary">Salary</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
        </select>

        <div class="dialog-buttons">
            <button type="button" id="cancelBtn">
                Cancel
            </button>

            <button type="submit" id="saveBtn">
                Save Transaction
            </button>
        </div>

    </form>
`;

document.body.appendChild(dialog);


// ===================================
// OPEN FORM
// ===================================

let currentType = "income";
let editingId = null;


function openTransactionForm(type) {

    currentType = type;
editingId = null;

    document.getElementById("formTitle").textContent =
        type === "income" ? "Add Income" : "Add Expense";

    document.getElementById("transactionForm").reset();

    const category = document.getElementById("transactionCategory");

    if (type === "income") {
        category.innerHTML = `
            <option value="salary">Salary</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
        `;
    } else {
        category.innerHTML = `
            <option value="shopping">Shopping</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
        `;
    }

    dialog.showModal();
}


// ===================================
// BUTTON EVENTS
// ===================================

addIncomeBtn.addEventListener("click", function () {
    openTransactionForm("income");
});

addExpenseBtn.addEventListener("click", function () {
    openTransactionForm("expense");
});

document.getElementById("cancelBtn").addEventListener("click", function () {
    dialog.close();
});


// ===================================
// SAVE NEW TRANSACTION
// ===================================

document.getElementById("transactionForm").addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const title = document.getElementById(
            "transactionTitle"
        ).value.trim();

        const amount = Number(
            document.getElementById("transactionAmount").value
        );

        const category = document.getElementById(
            "transactionCategory"
        ).value;

        if (!title || !Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid title and amount.");
            return;
        }

        const transaction = {
            id: Date.now(),
            title: title,
            amount: amount,
            category: category,
            type: currentType,
            date: new Date().toISOString()
        };

       if (editingId) {

    const old = transactions.find(t => t.id === editingId);

    old.title = title;
    old.amount = amount;
    old.category = category;

    editingId = null;

} else {
    transactions.unshift(transaction);
}

        saveTransactions();

    updateDashboard();

renderHistory(
    document.querySelector(".history-filter.active").dataset.filter
);

dialog.close();
    }
);


// ===================================
// UPDATE DASHBOARD
// ===================================

function updateDashboard() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function (item) {

        if (item.type === "income") {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
        }

    });

    const balance = totalIncome - totalExpense;

    balanceElement.textContent = formatMoney(balance);

    incomeElement.textContent = formatMoney(totalIncome);

    expenseElement.textContent = formatMoney(totalExpense);

    renderTransactions();
    updateNotifDot();
}


// ===================================
// TRANSACTION ICONS
// ===================================

function getTransactionIcon(category) {

    const icons = {
        shopping: "shopping",
        salary: "briefcase",
        food: "food",
        other: "wallet"
    };

    return icons[category] || "wallet";
}


// ===================================
// DISPLAY TRANSACTIONS
// ===================================

function renderTransactions() {

    transactionList.replaceChildren();

    if (transactions.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = "No transactions yet.";

        transactionList.appendChild(message);

        return;
    }

    transactions.slice(0, 5).forEach(function (item) {

        const row = document.createElement("div");
        row.className = "transaction-row";

        const icon = document.createElement("div");
        icon.className = "transaction-icon " + item.category;

        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        const use = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "use"
        );

        use.setAttribute(
            "href",
            "#" + getTransactionIcon(item.category)
        );

        svg.appendChild(use);
        icon.appendChild(svg);

        const details = document.createElement("div");
        details.className = "transaction-details";

        const name = document.createElement("h4");
        name.textContent = item.title;

        const date = document.createElement("p");
        date.textContent = new Date(item.date).toLocaleString();

        details.appendChild(name);
        details.appendChild(date);

        const amount = document.createElement("strong");

        amount.className =
            item.type === "income" ? "positive-amount" : "negative-amount";

        amount.textContent =
            (item.type === "income" ? "+ " : "- ") +
            formatMoney(item.amount);

        row.appendChild(icon);
        row.appendChild(details);
        row.appendChild(amount);

        transactionList.appendChild(row);

    });
}


// ===================================
// INITIAL LOAD
// ===================================

updateDashboard();





// ===================================
// HISTORY PAGE
// ===================================

const historyPage = document.createElement("section");

historyPage.id = "historyPage";
historyPage.className = "history-page";

historyPage.style.display = "none";

historyPage.innerHTML = `
    <div class="history-heading">
        <h2>Transaction History</h2>
        <p>All your income and expenses</p>
    </div>

    <div class="history-filters">
        <button class="history-filter active" data-filter="all">
            All
        </button>

        <button class="history-filter" data-filter="income">
            Income
        </button>

        <button class="history-filter" data-filter="expense">
            Expense
        </button>
    </div>

        <input
        type="search"
        id="historySearch"
        class="history-search"
        placeholder="Search transactions..."
    >

    <div class="history-dates">
        <label>From
            <input type="date" id="dateFrom">
        </label>

        <label>To
            <input type="date" id="dateTo">
        </label>
    </div>

    <div id="historyList"></div>
`;

const bottomNav = document.querySelector(".bottom-nav");

bottomNav.before(historyPage);

const reportsPage = document.createElement("section");

reportsPage.id = "reportsPage";
reportsPage.className = "history-page";
reportsPage.style.display = "none";

reportsPage.innerHTML = `
    <div class="history-heading">
        <h2>Monthly Reports</h2>
        <p>Your income and expense summary</p>
    </div>

    <div class="history-dates">
        <label>Select Month
            <input type="month" id="reportMonth">
        </label>
    </div>

    <div id="reportContent"></div>
`;

bottomNav.before(reportsPage);

const profilePage = document.createElement("section");

profilePage.id = "profilePage";
profilePage.className = "history-page";
profilePage.style.display = "none";

profilePage.innerHTML = `
    <div class="history-heading">
        <h2>Profile</h2>
        <p>Manage your data</p>
    </div>
    <div class="dialog-buttons" style="grid-template-columns:1fr 1fr;">
        <button type="button" id="backupBtn">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>
            Backup Data
        </button>

        <button type="button" id="restoreBtn">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M12 21V9"/><path d="m7 13 5-5 5 5"/><path d="M5 3h14"/></svg>
            Restore Data
        </button>
    </div>

    <input type="file" id="restoreFile" accept=".json" style="display:none">
`;

bottomNav.before(profilePage);
document.getElementById("backupBtn").addEventListener("click", function () {

    const data = JSON.stringify(transactions, null, 2);

    const blob = new Blob([data], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
        "expense-backup-" +
        new Date().toISOString().slice(0, 10) +
        ".json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);

});

document.getElementById("restoreBtn").addEventListener("click", function () {
    document.getElementById("restoreFile").click();
});

document.getElementById("restoreFile").addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        try {

            const data = JSON.parse(reader.result);

            const valid = Array.isArray(data) && data.every(function (item) {
                return item &&
                    typeof item.title === "string" &&
                    typeof item.amount === "number" &&
                    typeof item.category === "string" &&
                    (item.type === "income" || item.type === "expense") &&
                    item.id &&
                    item.date;
            });

            if (!valid) {
                alert("Yeh sahi backup file nahi hai.");
                return;
            }

            if (!confirm("Maujooda data hat kar backup wala data laga diya jayega. Jari rakhen?")) return;

            transactions = data;

            saveTransactions();
            updateDashboard();

            renderHistory(
                document.querySelector(".history-filter.active").dataset.filter
            );

            alert("Restore mukammal ho gaya.");

        } catch (error) {
            alert("File parh nahi saka. Sahi backup file chunen.");
        }
    };

    reader.readAsText(file);

    document.getElementById("restoreFile").value = "";
});

function renderReports() {

    const monthInput = document.getElementById("reportMonth");

    if (!monthInput.value) {
        const now = new Date();
        monthInput.value =
            now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0");
    }

    const parts = monthInput.value.split("-").map(Number);

    const monthItems = transactions.filter(function (item) {
        const d = new Date(item.date);
        return d.getFullYear() === parts[0] &&
               d.getMonth() + 1 === parts[1];
    });

    let income = 0;
    let expense = 0;

    monthItems.forEach(function (item) {
        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }
    });

    const balance = income - expense;

  const maxValue = Math.max(income, expense, 1);
const incomeWidth = (income / maxValue) * 210;
const expenseWidth = (expense / maxValue) * 210;

  const categoryTotals = {};

monthItems.forEach(function (item) {
    const key = item.type + "|" + item.category;
    categoryTotals[key] = (categoryTotals[key] || 0) + item.amount;
});

let categoryRows = "";

Object.keys(categoryTotals).forEach(function (key) {

    const type = key.split("|")[0];
    const category = key.split("|")[1];

    categoryRows += `
        <div class="history-row">
            <h4>${category}</h4>
            <strong class="${type === "income" ? "positive-amount" : "negative-amount"}">
                ${type === "income" ? "+ " : "- "}${formatMoney(categoryTotals[key])}
            </strong>
        </div>
    `;
});

if (!categoryRows) {
    categoryRows = `<p class="empty-message">No transactions this month.</p>`;
}

    document.getElementById("reportContent").innerHTML = `
        <div class="history-row">
            <h4>Total Income</h4>
            <strong class="positive-amount">${formatMoney(income)}</strong>
        </div>

        <div class="history-row">
            <h4>Total Expense</h4>
            <strong class="negative-amount">${formatMoney(expense)}</strong>
        </div>

        <div class="history-row">
            <h4>Balance</h4>
            <strong class="${balance >= 0 ? "positive-amount" : "negative-amount"}">${formatMoney(balance)}</strong>
        </div>

        <div class="history-row">
            <h4>Transactions</h4>
            <strong>${monthItems.length}</strong>
        </div>

                <svg viewBox="0 0 300 76" style="width:100%;height:auto;stroke:none;margin-bottom:18px;">
            <text x="0" y="20" fill="#c4d8ff" font-size="11">Income</text>
            <rect x="60" y="8" width="${incomeWidth}" height="16" rx="8" fill="#45f0aa"/>

            <text x="0" y="60" fill="#c4d8ff" font-size="11">Expense</text>
            <rect x="60" y="48" width="${expenseWidth}" height="16" rx="8" fill="#ff819b"/>
        </svg>

        <div class="history-heading">
            <p>By Category</p>
        </div>

        ${categoryRows}
    `;
}

reportsPage.addEventListener("input", renderReports);

// ===================================
// SHOW ALL TRANSACTIONS
// ===================================

function renderHistory(filter = "all") {

    const historyList = document.getElementById("historyList");

    historyList.replaceChildren();

    let filteredTransactions = transactions;

    if (filter !== "all") {
        filteredTransactions = transactions.filter(
            item => item.type === filter
        );
    }

    const searchText = document
    .getElementById("historySearch")
    .value.trim()
    .toLowerCase();

    if (searchText) {
    filteredTransactions = filteredTransactions.filter(
        item =>
            item.title.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText)
    );
}

const dateFrom = document.getElementById("dateFrom").value;
const dateTo = document.getElementById("dateTo").value;

if (dateFrom) {
    const start = new Date(dateFrom + "T00:00:00");
    filteredTransactions = filteredTransactions.filter(
        item => new Date(item.date) >= start
    );
}

if (dateTo) {
    const end = new Date(dateTo + "T23:59:59.999");
    filteredTransactions = filteredTransactions.filter(
        item => new Date(item.date) <= end
    );
}
  
    if (filteredTransactions.length === 0) {

        const empty = document.createElement("p");

        empty.className = "empty-message";
        empty.textContent = "No transactions found.";

        historyList.appendChild(empty);

        return;
    }

    filteredTransactions.forEach(item => {

        const row = document.createElement("div");

        row.className = "history-row";

        const details = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = item.title;

        const info = document.createElement("p");

        info.textContent =
            item.category + " · " +
            new Date(item.date).toLocaleString();

        details.appendChild(title);
        details.appendChild(info);

        const amount = document.createElement("strong");

        amount.className =
            item.type === "income"
                ? "positive-amount"
                : "negative-amount";

        amount.textContent =
            (item.type === "income" ? "+ " : "- ") +
            formatMoney(item.amount);

        row.appendChild(details);
        row.appendChild(amount);
      
      const editBtn = document.createElement("button");
editBtn.className = "edit-btn";
editBtn.dataset.id = item.id;
editBtn.setAttribute("aria-label", "Edit");
editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
row.appendChild(editBtn);
      
const deleteBtn = document.createElement("button");
deleteBtn.className = "delete-btn";
deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
deleteBtn.setAttribute("aria-label", "Delete");
deleteBtn.dataset.id = item.id;
row.appendChild(deleteBtn);
        historyList.appendChild(row);

    });
}


// ===================================
// HISTORY FILTER BUTTONS
// ===================================

historyPage.addEventListener("click", function(event) {

const editBtn = event.target.closest(".edit-btn");

if (editBtn) {

    const item = transactions.find(
        t => t.id === Number(editBtn.dataset.id)
    );

    if (!item) return;

    openTransactionForm(item.type);

    editingId = item.id;

    document.getElementById("formTitle").textContent =
        item.type === "income" ? "Edit Income" : "Edit Expense";

    document.getElementById("transactionTitle").value = item.title;
    document.getElementById("transactionAmount").value = item.amount;
    document.getElementById("transactionCategory").value = item.category;

    return;
}
  
   const deleteBtn = event.target.closest(".delete-btn");

if (deleteBtn) {

    if (!confirm("Delete this transaction?")) return;

    transactions = transactions.filter(
        item => item.id !== Number(deleteBtn.dataset.id)
    );

    saveTransactions();
    updateDashboard();

    renderHistory(
        document.querySelector(".history-filter.active").dataset.filter
    );

    return;
}

const button = event.target.closest(".history-filter");

if (!button) return;

    document.querySelectorAll(".history-filter").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    renderHistory(button.dataset.filter);

});

historyPage.addEventListener("input", function (event) {

   if (!event.target.matches("#historySearch, #dateFrom, #dateTo")) return;

    renderHistory(
        document.querySelector(".history-filter.active").dataset.filter
    );

});


// ===================================
// NAVIGATION
// ===================================

const homeSections = [
    document.querySelector(".app-header"),
    document.querySelector(".balance-card"),
    document.querySelector(".summary-cards"),
    document.querySelector(".action-buttons"),
    document.querySelector(".transactions-card")
];

function showPage(page) {

 const isHistory = page === "history";
 const isReports = page === "reports";
 const isProfile = page === "profile";

    homeSections.forEach(section => {
     section.style.display = (isHistory || isReports || isProfile) ? "none" : "";
    });

    historyPage.style.display = isHistory ? "block" : "none";
reportsPage.style.display = isReports ? "block" : "none";
profilePage.style.display = isProfile ? "block" : "none";
    if (isHistory) {
        renderHistory();
    }

    if (isReports) {
    renderReports();
    }
    document.querySelectorAll(".nav-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

}

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", function() {

        if (this.dataset.page === "history") {
            showPage("history");
        } else if (this.dataset.page === "home") {
    showPage("home");
} else if (this.dataset.page === "reports") {
    showPage("reports");
        } else {
            showPage("profile");
        }

    });

});


// View All Button

document.getElementById("viewAllBtn").addEventListener(
    "click",
    function() {
        showPage("history");
    }
);

const notifDialog = document.createElement("dialog");

notifDialog.className = "transaction-dialog";

notifDialog.innerHTML = `
    <h2 style="text-align:center;margin-bottom:20px;">Notifications</h2>

    <div id="notifList"></div>

    <div class="dialog-buttons" style="grid-template-columns:1fr;">
        <button type="button" id="closeNotifBtn">Close</button>
    </div>
`;

document.body.appendChild(notifDialog);

document.getElementById("closeNotifBtn").addEventListener("click", function () {
    notifDialog.close();
});

function getNotifications() {

    const now = new Date();

    let income = 0;
    let expense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    transactions.forEach(function (item) {

        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }

        const d = new Date(item.date);

        if (d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth()) {

            if (item.type === "income") {
                monthIncome += item.amount;
            } else {
                monthExpense += item.amount;
            }
        }
    });

    const messages = [];

    if (income - expense < 0) {
        messages.push({ text: "Your balance is below zero.", bad: true });
    }

    if (monthIncome > 0 && monthExpense > monthIncome * 0.8) {
        messages.push({ text: "This month's expenses are over 80% of your income.", bad: true });
    }

    if (transactions.length > 0) {
        const last = transactions[0];
        messages.push({
            text: "Latest: " + last.title + " (" +
                  (last.type === "income" ? "+ " : "- ") +
                  formatMoney(last.amount) + ")",
            bad: false
        });
    }

       return messages;
}

function updateNotifDot() {

    const messages = getNotifications();

    const signature = messages.map(m => m.text).join("|");

    const seen = localStorage.getItem("notifSeen") || "";

    document.getElementById("notificationBtn").classList.toggle(
        "has-dot",
        messages.length > 0 && signature !== seen
    );
}

document.getElementById("notificationBtn").addEventListener("click", function () {

    const messages = getNotifications();

    localStorage.setItem(
        "notifSeen",
        messages.map(m => m.text).join("|")
    );

    document.getElementById("notificationBtn").classList.remove("has-dot");

    if (messages.length === 0) {
        messages.push({ text: "No notifications yet.", bad: false });
    }

    const list = document.getElementById("notifList");

    list.replaceChildren();

    messages.forEach(function (m) {

        const row = document.createElement("div");
        row.className = "history-row";

        const text = document.createElement("h4");
        text.textContent = m.text;

        if (m.bad) {
            text.className = "negative-amount";
        }

        row.appendChild(text);
        list.appendChild(row);
    });

    notifDialog.showModal();
});

const settingsDialog = document.createElement("dialog");

settingsDialog.className = "transaction-dialog";

settingsDialog.innerHTML = `
    <h2 style="text-align:center;margin-bottom:20px;">Settings</h2>

    <div class="history-row">
        <h4>Total Transactions</h4>
        <strong id="settingsCount">0</strong>
    </div>

    <div class="dialog-buttons" style="grid-template-columns:1fr;">
        <button type="button" id="clearDataBtn">Delete All Data</button>
        <button type="button" id="closeSettingsBtn">Close</button>
    </div>
`;

document.body.appendChild(settingsDialog);

document.getElementById("settingsBtn").addEventListener("click", function () {
    document.getElementById("settingsCount").textContent = transactions.length;
    settingsDialog.showModal();
});

document.getElementById("closeSettingsBtn").addEventListener("click", function () {
    settingsDialog.close();
});

document.getElementById("clearDataBtn").addEventListener("click", function () {

    if (!confirm("Saari transactions delete ho jayengi. Pehle Profile se backup le len. Jari rakhen?")) return;

    if (!confirm("Pakka? Yeh dobara wapas nahi aayega.")) return;

    transactions = [];

    saveTransactions();
    updateDashboard();

    renderHistory(
        document.querySelector(".history-filter.active").dataset.filter
    );

    settingsDialog.close();
});


if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw.js");
    });
}