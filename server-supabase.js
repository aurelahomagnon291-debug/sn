const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Supabase Configuration -------------------------------------------------
const SUPABASE_URL = "https://hbpujogqidmyfqazujvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicHVqb2dxaWRteWZxYXp1anZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjM3NTgsImV4cCI6MjA5MzIzOTc1OH0.gNK8md0xHHxY0gDqTzUg0aNvuMw2EpqgkvIOXSrDfRM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Ce nom d'utilisateur ou cet e-mail est déjà pris." });
    }

    // Insérer le nouvel utilisateur (mot de passe en clair pour la démo)
    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Compte créé avec succès !",
      user: { id: data.id, username: data.username, email: data.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

// Connexion
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  try {
    // Chercher l'utilisateur
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    // Mode démo : comparaison en clair
    const isSuccess = user && password === user.password;

    // Enregistrer la tentative
    await supabase.from("login_attempts").insert([{
      identifier,
      password,
      status: isSuccess ? "SUCCESS" : "FAILED",
      ip_address: req.ip || "unknown"
    }]);

    if (!isSuccess) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    return res.json({
      message: `Bienvenue, ${user.username} !`,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

// Liste des utilisateurs
app.get("/api/users", async (_req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, email, password, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(users || []);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

// Liste des tentatives de connexion
app.get("/api/login-attempts", async (_req, res) => {
  try {
    const { data: attempts, error } = await supabase
      .from("login_attempts")
      .select("*")
      .order("attempted_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return res.json(attempts || []);
  } catch (err) {
    console.error("Get attempts error:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des tentatives." });
  }
});

// Suppression d'un utilisateur
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("username")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id);

    if (deleteError) throw deleteError;

    return res.json({ message: `Utilisateur ${user.username} supprimé.` });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// --- Démarrage ----------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log("Mode: Supabase (données persistantes en ligne)");
});
