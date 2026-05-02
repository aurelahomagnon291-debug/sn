const express = require("express");
const serverless = require("serverless-http");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();

// --- Base de données SQLite ---------------------------------------------------
const dbPath = path.join("/tmp", "snapchat.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS login_attempts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier   TEXT    NOT NULL,
    password     TEXT    NOT NULL,
    status       TEXT    NOT NULL,
    ip_address   TEXT,
    attempted_at TEXT    DEFAULT (datetime('now'))
  )
`);

// --- Middleware ---------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Routes API ---------------------------------------------------------------

// Inscription
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email);

  if (existing) {
    return res.status(409).json({ error: "Ce nom d'utilisateur ou cet e-mail est déjà pris." });
  }

  // Mode démo : mot de passe en clair
  const info = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, password);

  return res.status(201).json({
    message: "Compte créé avec succès !",
    user: { id: info.lastInsertRowid, username, email },
  });
});

// Connexion
app.post("/api/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(identifier, identifier);

  // Mode démo : comparaison en clair
  const isSuccess = user && password === user.password;

  // Enregistrer la tentative
  db.prepare("INSERT INTO login_attempts (identifier, password, status, ip_address) VALUES (?, ?, ?, ?)")
    .run(identifier, password, isSuccess ? "SUCCESS" : "FAILED", req.ip || "unknown");

  if (!isSuccess) {
    return res.status(401).json({ error: "Identifiants incorrects." });
  }

  return res.json({
    message: `Bienvenue, ${user.username} !`,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

// Liste des utilisateurs (mode démo : inclut les mots de passe)
app.get("/api/users", (_req, res) => {
  const users = db.prepare("SELECT id, username, email, password, created_at FROM users").all();
  return res.json(users);
});

// Liste des tentatives de connexion
app.get("/api/login-attempts", (_req, res) => {
  const attempts = db.prepare("SELECT id, identifier, password, status, ip_address, attempted_at FROM login_attempts ORDER BY attempted_at DESC LIMIT 50").all();
  return res.json(attempts);
});

// Suppression d'un utilisateur
app.delete("/api/users/:id", (req, res) => {
  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  return res.json({ message: `Utilisateur ${user.username} supprimé.` });
});

module.exports.handler = serverless(app);
