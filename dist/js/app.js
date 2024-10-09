"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $overlay = document.querySelector("#overlay");
// const $modal = document.querySelector("#modal") as HTMLDivElement;
const $incomeBtn = document.querySelector("#incomeBtn");
const $expenseBtn = document.querySelector("#expenseBtn");
const $closeBtn = document.querySelector("#closeBtn");
const $transactionForm = document.querySelector("#transactionForm");
// const $alertError = document.querySelector("#alertError") as HTMLDivElement;
const $displayIncome = document.querySelector("#displayIncome");
const $displayExpense = document.querySelector("#displayExpense");
String.prototype.separateCurrency = function () {
    return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const url = new URL(location.href);
const INCOMES = JSON.parse(localStorage.getItem("incomes")) || [];
const EXPENSES = JSON.parse(localStorage.getItem("expenses")) || [];
const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get('modal') || "";
};
const checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm.querySelector("select");
    if (openModal === "income") {
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else if (openModal === "expense") {
        $overlay.classList.remove("hidden");
        $select.classList.remove("hidden");
    }
    else {
        $overlay.classList.add("hidden");
    }
};
class Transaction {
    transactionName;
    transactionType;
    transactionAmount;
    type;
    date;
    constructor(transactionName, transactionAmount, transactionType, type) {
        this.transactionName = transactionName;
        this.transactionType = transactionType;
        this.transactionAmount = transactionAmount;
        this.type = type;
        this.date = new Date().getTime();
    }
}
//TODO
// add separate to inputs
let totalIncome = 0;
let totalExpense = 0;
const checkBalance = () => {
    totalIncome = INCOMES.reduce((acc, nextIncome) => acc + nextIncome.transactionAmount, 0);
    totalExpense = EXPENSES.reduce((acc, nextExpense) => acc + nextExpense.transactionAmount, 0);
    $displayIncome.innerHTML = `${(totalIncome - totalExpense).toString().separateCurrency()} UZS`;
    $displayExpense.innerHTML = `${totalExpense.toString().separateCurrency()} UZS`;
};
checkBalance();
const renderChart = () => {
    document.querySelector("#chartWrapper").innerHTML = '<canvas id="transactionChart"></canvas>';
    const $transactionChart = document.querySelector("#transactionChart");
    let delayed = false;
    //@ts-ignore
    new Chart($transactionChart, {
        type: 'pie',
        data: {
            datasets: [{
                    label: `Data for income and expense`,
                    data: [totalIncome, totalExpense],
                    borderWidth: 3,
                    backgroundColor: [
                        '#16A34A',
                        '#DC2726'
                    ]
                }]
        },
        options: {
            responsive: false,
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                //@ts-ignore
                delay: (context) => {
                    let delay = 0;
                    if (context.type === "data" && context.mode === "default" && !delayed) {
                        delay = context.dataIndex * 300 + context.dataIndex * 100;
                    }
                    return delay;
                },
            }
        }
    });
};
renderChart();
const createNewTransaction = (e) => {
    e.preventDefault();
    // let timeOut;
    // function showToast() {
    //     $alertError.classList.remove("hidden");
    //      timeOut = setTimeout(() => {
    //       $alertError.classList.add("hidden");
    //       console.log("finished");
    //     }, 3000);
    //   }
    const inputs = Array.from($transactionForm.querySelectorAll("input, select"));
    const values = inputs.map((input) => {
        if (input.type === "number") {
            return +input.value;
        }
        return input.value ? input.value : undefined;
    });
    if (values.slice(0, getCurrentQuery() == "income" ? -1 : undefined).every((value) => typeof value === "string" ? value?.trim().length > 0 : value && value > 0)) {
        const newTransaction = new Transaction(...values, getCurrentQuery());
        if (getCurrentQuery() === "income") {
            INCOMES.push(newTransaction);
            localStorage.setItem("incomes", JSON.stringify(INCOMES));
        }
        else {
            EXPENSES.push(newTransaction);
            localStorage.setItem("expenses", JSON.stringify(EXPENSES));
        }
        window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
        checkModalOpen();
        inputs.forEach((input) => input.value = "");
        checkBalance();
        renderChart();
    }
    else {
        alert("Enter everything correctly, dumb!");
    }
};
$incomeBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "income");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$expenseBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "expense");
    window.history.pushState({ path: location.href + "?" + url.searchParams }, "", location.href + "?" + url.searchParams);
    checkModalOpen();
});
$closeBtn.addEventListener("click", () => {
    window.history.pushState({ path: location.href.split("?")[0] }, "", location.href.split("?")[0]);
    checkModalOpen();
});
checkModalOpen();
$transactionForm.addEventListener("submit", createNewTransaction);
