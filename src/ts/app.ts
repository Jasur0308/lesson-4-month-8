const $overlay = document.querySelector("#overlay") as HTMLDivElement;
// const $modal = document.querySelector("#modal") as HTMLDivElement;
const $incomeBtn = document.querySelector("#incomeBtn") as HTMLButtonElement;
const $expenseBtn = document.querySelector("#expenseBtn") as HTMLButtonElement;
const $closeBtn = document.querySelector("#closeBtn") as HTMLButtonElement;
const $transactionForm = document.querySelector("#transactionForm") as HTMLFormElement;
// const $alertError = document.querySelector("#alertError") as HTMLDivElement;
const $displayIncome = document.querySelector("#displayIncome") as HTMLElement;
const $displayExpense = document.querySelector("#displayExpense") as HTMLElement;

export{}
declare global {
    interface String {
        separateCurrency(): string;
    }
}

String.prototype.separateCurrency = function() : string {
    return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",") as string;
}

type TIncome = {
    transactionName: string;
    transactionType: string | undefined;
    transactionAmount: number;
    type: string;
    date: number;
}

const url = new URL(location.href);

const INCOMES = JSON.parse(localStorage.getItem("incomes") as string) || []
const EXPENSES = JSON.parse(localStorage.getItem("expenses") as string) || []

const getCurrentQuery = () => {
    return new URLSearchParams(location.search).get('modal') || "" as string
}

const  checkModalOpen = () => {
    let openModal = getCurrentQuery();
    let $select = $transactionForm.querySelector("select") as HTMLSelectElement;
    if(openModal === "income"){
        $overlay.classList.remove("hidden");
        $select.classList.add("hidden");
    }
    else if(openModal === "expense"){
        $overlay.classList.remove("hidden");
        $select.classList.remove("hidden");
    }
    else{
        $overlay.classList.add("hidden")
    }
}

class Transaction {
    transactionName: string
    transactionType: string | undefined
    transactionAmount: number
    type: string
    date: number
    constructor(transactionName: string, transactionAmount: number, transactionType: string | undefined, type: string){
        this.transactionName = transactionName
        this.transactionType = transactionType
        this.transactionAmount = transactionAmount
        this.type = type
        this.date = new Date().getTime()
    }
}

//TODO
// add separate to inputs

let totalIncome = 0;
let totalExpense = 0;

const checkBalance = () => {
    totalIncome = INCOMES.reduce((acc : number, nextIncome : TIncome) => acc + nextIncome.transactionAmount, 0);
    totalExpense = EXPENSES.reduce((acc : number, nextExpense : TIncome) => acc + nextExpense.transactionAmount, 0);
    $displayIncome.innerHTML = `${(totalIncome - totalExpense).toString().separateCurrency()} UZS`;
    $displayExpense.innerHTML = `${totalExpense.toString().separateCurrency()} UZS`;
}

checkBalance();


const renderChart = () => {
    (document.querySelector("#chartWrapper") as HTMLDivElement).innerHTML = '<canvas id="transactionChart"></canvas>'
    const $transactionChart = document.querySelector("#transactionChart") as HTMLCanvasElement;

    let delayed: boolean = false;

    //@ts-ignore
    new Chart ($transactionChart, {
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
}

renderChart();

const createNewTransaction = (e: Event) => {
    e.preventDefault();

    // let timeOut;
    // function showToast() {
    //     $alertError.classList.remove("hidden");
    //      timeOut = setTimeout(() => {
    //       $alertError.classList.add("hidden");
    //       console.log("finished");
    //     }, 3000);
    //   }
      

    const inputs = Array.from($transactionForm.querySelectorAll("input, select")) as HTMLInputElement[]
    const values: (string | number | undefined)[] = inputs.map((input) => {
        if(input.type === "number"){
           return  +input.value
        }
        return input.value ? input.value : undefined
    });
    if(values.slice(0, getCurrentQuery() == "income" ? -1 : undefined).every((value) => typeof value === "string" ? value?.trim().length > 0 : value && value > 0 )){
        const newTransaction = new Transaction(...values as [string, number, string | undefined], getCurrentQuery())
        if (getCurrentQuery() === "income") {
            INCOMES.push(newTransaction);
            localStorage.setItem("incomes", JSON.stringify(INCOMES));
        }
        else {
            EXPENSES.push(newTransaction);
            localStorage.setItem("expenses", JSON.stringify(EXPENSES));
        }
        window.history.pushState({path: location.href.split("?")[0]}, "", location.href.split("?")[0]);
        checkModalOpen()
        inputs.forEach((input: HTMLInputElement) => input.value = "")
        checkBalance();
        renderChart();
    }
    else{
        alert("Enter everything correctly, dumb!")
    }
}

$incomeBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "income")
    window.history.pushState({path: location.href + "?" + url.searchParams}, "", location.href + "?" + url.searchParams);
    checkModalOpen()
})

$expenseBtn.addEventListener("click", () => {
    url.searchParams.set("modal", "expense")
    window.history.pushState({path: location.href + "?" + url.searchParams}, "", location.href + "?" + url.searchParams);
    checkModalOpen()
})

$closeBtn.addEventListener("click", () => {
    window.history.pushState({path: location.href.split("?")[0]}, "", location.href.split("?")[0]);
    checkModalOpen()
})

checkModalOpen()

$transactionForm.addEventListener("submit", createNewTransaction);