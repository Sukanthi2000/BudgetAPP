// ---------- CHECK LOGIN ----------

const userId = localStorage.getItem("userId")

if(!userId){
alert("Please login first")
window.location = "index.html"
}


// ---------- PAGE LOAD ----------

window.onload = function(){

loadTransactions()
getSummary()

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

alert(data.message)

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

alert(data.message)

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


// ---------- LOAD TRANSACTIONS ----------

function loadTransactions(){

fetch("/transactions/" + userId)

.then(res=>res.json())

.then(data=>{

let rows = ""

data.forEach(t => {

rows += `
<tr>
<td>${t.date}</td>
<td>${t.message || ""}</td>
<td>${t.type}</td>
<td>₹ ${t.amount}</td>
</tr>
`

})

document.getElementById("transactions").innerHTML = rows

})

.catch(err=>{
console.log(err)
})

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
