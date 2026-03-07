// ---------- CHECK LOGIN ----------

const userId = localStorage.getItem("userId")

if(!userId){
alert("Please login first")
window.location = "index.html"
}

// ---------- BACK BUTTON / CACHE PROTECTION ----------
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    if(!localStorage.getItem("userId")){
        alert("Please login first");
        window.location = "index.html";
    }
};


// ---------- PAGE LOAD ----------

window.onload = function(){

loadTransactions()
getSummary()

}
// ---------- LOAD TRANSACTIONS ----------
function loadTransactions() {
    fetch("/transactions/" + userId)  // Make sure this endpoint returns all transactions for the user
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("transactions");
        tbody.innerHTML = ""; // Clear existing rows

        let totalSpent = 0;
        let currentBalance = 0;

        data.forEach(tx => {
            // Calculate balance dynamically (optional)
            if(tx.type === "credit") currentBalance += tx.amount;
            else if(tx.type === "debit") currentBalance -= tx.amount;

            if(tx.type === "debit") totalSpent += tx.amount;

            const tr = document.createElement("tr");

            const date = new Date(tx.date);
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${tx.message || ""}</td>
                <td>${tx.type}</td>
                <td>₹${tx.amount}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update summary values on page
        document.getElementById("balance").innerText = currentBalance;
        document.getElementById("spent").innerText = totalSpent;
    })
    .catch(err => {
        console.log(err);
        alert("Error loading transactions");
    });
}
// ---------- ADD CREDIT ----------

function addCredit(){

const amount = document.getElementById("amount").value
const date = document.getElementById("date").value
const message = document.getElementById("message").value

if(amount === "" || date === ""){
alert("Enter amount and date")
return
}

fetch("/transaction",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

userId:userId,
type:"credit",
amount:parseInt(amount),
date:date,
message:message

})

})

.then(res=>res.json())

.then(data=>{

//alert(data.message)

clearInputs()

loadTransactions()
getSummary()

})

.catch(err=>{
console.log(err)
alert("Error adding credit")
})

}


// ---------- ADD DEBIT ----------

function addDebit(){

const amount = parseInt(document.getElementById("amount").value)
const date = document.getElementById("date").value
const message = document.getElementById("message").value

if(!amount || !date){
alert("Enter amount and date")
return
}

// First get current balance
fetch("/summary/" + userId)

.then(res => res.json())

.then(data => {

const credit = data.credit || 0
const debit = data.debit || 0
const balance = credit - debit

// Check balance before debit
if(amount > balance){

alert("⚠ Minimum balance reached. Cannot debit more than available balance.")
return

}

// If balance is sufficient, perform debit
fetch("/transaction",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

userId:userId,
type:"debit",
amount:amount,
date:date,
message:message

})

})

.then(res=>res.json())
.then(data=>{

    
//alert(data.message)

document.getElementById("amount").value=""
document.getElementById("message").value=""

loadTransactions()
getSummary()

})

})


.catch(err=>{
console.log(err)
alert("Error adding debit")
})

}


// ---------- GET SUMMARY ----------

function getSummary(){

fetch("/summary/" + userId)

.then(res=>res.json())

.then(data=>{

const credit = data.credit || 0
const debit = data.debit || 0
const balance = data.balance || 0

document.getElementById("balance").innerText = balance
document.getElementById("spent").innerText = debit

})

.catch(err=>{
console.log(err)
})

}
//------------Download Function----------
function downloadStatement() {
    // Optional: include summary at top
    const balance = document.getElementById("balance").innerText.replace("₹", "").trim();
    const totalSpent = document.getElementById("spent").innerText.replace("₹", "").trim();

    let csvContent = `Current Balance,${balance}\nTotal Spent,${totalSpent}\n\n`;
    csvContent += "Date,Message,Type,Amount\n";

    // Loop through transactions table
    const rows = document.querySelectorAll("#transactions tr");
    rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0) {
            // Format date as YYYY-MM-DD
            const date = new Date(cols[0].innerText.trim());
            const formattedDate = date.toISOString().split('T')[0];

            // Clean amount: remove ₹ and commas, keep as plain number
            const amount = cols[3].innerText.replace("₹", "").replace(",", "").trim();

            const rowData = [
                formattedDate,
                cols[1].innerText.trim(),
                cols[2].innerText.trim(),
                amount
            ].join(",");

            csvContent += rowData + "\n";
        }
    });

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
}

// ---------- CLEAR INPUTS ----------

function clearInputs(){

document.getElementById("amount").value = ""
document.getElementById("message").value = ""

}

// ---------- PRINT STATEMENT ----------
function printStatement(){
    window.print()
}
//-------------logout---------------
function logout() {
    // 1️⃣ Clear the stored login info
    localStorage.removeItem("userId");  // user is now logged out

    // 2️⃣ Optional: alert the user
    alert("Logged out successfully");

    // 3️⃣ Redirect to login page
    window.location = "index.html";


}
