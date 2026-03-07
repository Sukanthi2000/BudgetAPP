let userId = localStorage.getItem("userId");

function signup() {
  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  }).then(res => res.json()).then(data => alert(data.message));
}

function login() {
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if(data.userId){
      localStorage.setItem("userId",data.userId)
      window.location="dashboard.html"
    } else {
      alert("Login failed")
    }
  });
}

function addCredit(){
  transaction("credit")
}

function addDebit(){
  transaction("debit")
}

function transaction(type){
  fetch("/transaction",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      userId:userId,
      type:type,
      amount:document.getElementById("amount").value
    })
  }).then(res=>res.json())
  .then(data=>alert(data.message))
}

function getSummary(){
 fetch(`/summary/${userId}`)
 .then(res=>res.json())
 .then(data=>{
   document.getElementById("summary").innerHTML=
   JSON.stringify(data)
 })
}