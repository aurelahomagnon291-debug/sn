const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const User = require("./models/User");
const LoginAttempt = require("./models/LoginAttempt");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Connexion MongoDB --------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/snapchat";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecte a MongoDB"))
  .catch((err) => {
    console.error("Erreur de connexion MongoDB:", err.message);
    process.exit(1);
  });

// --- Middleware ---------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// --- Routes API ---------------------------------------------------------------

// Inscription
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Le mot de passe doit contenir au moins 6 caracteres." });
  }

  try {
    const existing = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "Ce nom d'utilisateur ou cet e-mail est deja pris." });
    }

    const user = await User.create({ username, email, password });

    return res.status(201).json({
      message: "Compte cree avec succes !",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Connexion
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    const isSuccess = user && password === user.password;

    await LoginAttempt.create({
      identifier,
      password,
      status: isSuccess ? "SUCCESS" : "FAILED",
      ip_address: req.ip || "unknown",
    });

    if (!isSuccess) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    return res.json({
      message: `Bienvenue, ${user.username} !`,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Liste des utilisateurs (mode demo)
app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find({}).sort({ created_at: -1 });
    return res.json(
      users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        password: u.password,
        created_at: u.created_at,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Liste des tentatives de connexion (mode demo)
app.get("/api/login-attempts", async (_req, res) => {
  try {
    const attempts = await LoginAttempt.find({})
      .sort({ attempted_at: -1 })
      .limit(50);
    return res.json(
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
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Suppression d'un utilisateur
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: `Utilisateur ${user.username} supprime.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// --- Demarrage ----------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
