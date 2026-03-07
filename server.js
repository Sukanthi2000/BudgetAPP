const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        type TEXT,
        amount INTEGER
    )`);
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users(username,password) VALUES(?,?)",
    [username, password],
    function (err) {
      if (err) return res.send(err);
      res.send({ message: "User created" });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (!row) return res.send({ message: "Invalid login" });
      res.send({ message: "Login success", userId: row.id });
    }
  );
});

app.post("/transaction", (req, res) => {
  const { userId, type, amount } = req.body;

  db.run(
    "INSERT INTO transactions(userId,type,amount) VALUES(?,?,?)",
    [userId, type, amount],
    function (err) {
      if (err) return res.send(err);
      res.send({ message: "Transaction added" });
    }
  );
});

app.get("/summary/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    "SELECT type,SUM(amount) as total FROM transactions WHERE userId=? GROUP BY type",
    [userId],
    (err, rows) => {
      res.send(rows);
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});