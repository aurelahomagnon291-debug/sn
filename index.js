/**
 * Point d’entrée Express pour Vercel (détection automatique).
 * En local : utilise `npm start` (server.js) ou `npm run start:supabase`.
 */
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://hbpujogqidmyfqazujvm.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicHVqb2dxaWRteWZxYXp1anZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjM3NTgsImV4cCI6MjA5MzIzOTc1OH0.gNK8md0xHHxY0gDqTzUg0aNvuMw2EpqgkvIOXSrDfRM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Champs obligatoires" });
  }

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, password }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: "Compte créé", user: data });
});

app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .single();

  const isSuccess = user && password === user.password;

  await supabase.from("login_attempts").insert([
    { identifier, password, status: isSuccess ? "SUCCESS" : "FAILED" },
  ]);

  if (!isSuccess)
    return res.status(401).json({ error: "Identifiants incorrects" });
  return res.json({ message: `Bienvenue ${user.username}`, user });
});

app.get("/api/users", async (_req, res) => {
  const { data } = await supabase.from("users").select("*");
  res.json(data || []);
});

app.get("/api/login-attempts", async (_req, res) => {
  const { data } = await supabase
    .from("login_attempts")
    .select("*")
    .order("attempted_at", { ascending: false });
  res.json(data || []);
});

app.use(express.static(path.join(__dirname, "public")));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

module.exports = app;
