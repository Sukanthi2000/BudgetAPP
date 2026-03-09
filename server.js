const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));


// ---------------- CREATE DATABASE ----------------

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {

  if (err) {
    console.error("Database creation failed:", err);
    return;
  }

  console.log("Database ready");

  startServer();

});


// ---------------- START APP ----------------

function startServer(){

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// ---------------- CREATE TABLES ----------------

db.query(`
CREATE TABLE IF NOT EXISTS users(
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(100) UNIQUE,
 password VARCHAR(100)
)
`);

db.query(`
CREATE TABLE IF NOT EXISTS transactions(
 id INT AUTO_INCREMENT PRIMARY KEY,
 userId INT,
 type VARCHAR(10),
 amount INT,
 date DATE,
 message TEXT
)
`);

console.log("Tables verified");


// ---------------- SIGNUP ----------------

app.post("/signup",(req,res)=>{

 const {username,password} = req.body;

 db.query(
  "INSERT INTO users(username,password) VALUES(?,?)",
  [username,password],
  (err,result)=>{

   if(err){
    return res.send({message:"User already exists"});
   }

   res.send({message:"User created"});
  }
 );

});


// ---------------- LOGIN ----------------

app.post("/login",(req,res)=>{

 const {username,password} = req.body;

 db.query(
  "SELECT * FROM users WHERE username=? AND password=?",
  [username,password],
  (err,rows)=>{

   if(err){
    return res.send(err);
   }

   if(rows.length === 0){
    return res.send({message:"Invalid login, Signup if new user"});
   }

   res.send({
    message:"Login success",
    userId:rows[0].id
   });

  }
 );

});


// ---------------- ADD TRANSACTION ----------------

app.post("/transaction",(req,res)=>{

 const {userId,type,amount,date,message} = req.body;

 db.query(
  "INSERT INTO transactions(userId,type,amount,date,message) VALUES(?,?,?,?,?)",
  [userId,type,amount,date,message],
  (err,result)=>{

   if(err){
    return res.send(err);
   }

   res.send({id:result.insertId});

  }
 );

});


// ---------------- SUMMARY ----------------

app.get("/summary/:userId",(req,res)=>{

 const userId = req.params.userId;

 db.query(
  "SELECT type,SUM(amount) as total FROM transactions WHERE userId=? GROUP BY type",
  [userId],
  (err,rows)=>{

   if(err){
    return res.send(err);
   }

   let credit = 0;
   let debit = 0;

   rows.forEach(r=>{

    if(r.type === "credit"){
     credit = r.total;
    }

    if(r.type === "debit"){
     debit = r.total;
    }

   });

   const balance = credit - debit;

   res.send({credit,debit,balance});

  }
 );

});


// ---------------- GET ALL TRANSACTIONS ----------------

app.get("/transactions/:userId",(req,res)=>{

 const userId = req.params.userId;

 db.query(
  "SELECT * FROM transactions WHERE userId=? ORDER BY id DESC",
  [userId],
  (err,rows)=>{

   if(err){
    return res.send(err);
   }

   res.send(rows);

  }
 );

});


// ---------------- CURRENT BALANCE ----------------

app.get("/balance/:userId",(req,res)=>{

 const userId = req.params.userId;

 db.query(
  "SELECT type,amount FROM transactions WHERE userId=?",
  [userId],
  (err,rows)=>{

   if(err){
    return res.send(err);
   }

   let balance = 0;

   rows.forEach(t=>{

    if(t.type === "credit"){
     balance += t.amount;
    }

    if(t.type === "debit"){
     balance -= t.amount;
    }

   });

   res.send({balance});

  }
 );

});


// ---------------- START SERVER ----------------

app.listen(3000,"0.0.0.0",()=>{

 console.log("Server running on port 3000");

});

}
