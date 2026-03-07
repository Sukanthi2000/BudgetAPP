// ---------- UI SLIDER ----------

const loginText = document.querySelector(".title-text .login");
const loginFormUI = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

signupBtn.onclick = () => {
  loginFormUI.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};

loginBtn.onclick = () => {
  loginFormUI.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};

signupLink.onclick = () => {
  signupBtn.click();
  return false;
};


// ---------- SIGNUP API ----------

document.getElementById("signupForm").addEventListener("submit", function(e){

e.preventDefault()

const email = document.getElementById("signupEmail").value
const password = document.getElementById("signupPassword").value

fetch("/signup",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:email,
password:password
})

})

.then(res=>res.json())
.then(data=>{
alert(data.message)
})

})


// ---------- LOGIN API ----------

document.getElementById("loginForm").addEventListener("submit", function(e){

e.preventDefault()

const email = document.getElementById("loginEmail").value
const password = document.getElementById("loginPassword").value

fetch("/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:email,
password:password
})

})

.then(res=>res.json())
.then(data=>{

if(data.userId){

localStorage.setItem("userId",data.userId)

window.location="dashboard.html"

}else{

alert("Invalid Login")

}

})

})
