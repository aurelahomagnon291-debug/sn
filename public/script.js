// --- Helpers ------------------------------------------------------------------
function showMessage(el, text, isError) {
  el.textContent = text;
  el.className = "form-message " + (isError ? "error" : "success");
}

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
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return showMessage(msg, data.error || "Identifiants incorrects.", true);
      }

      showMessage(msg, `Bienvenue, ${data.user.username} !`, false);

      // Afficher le bouton pour ouvrir l'app Snapchat
      const snapSection = document.querySelector("#snapchat-app-section");
      const snapLink = document.querySelector("#snapchat-app-link");
      if (snapSection && snapLink) {
        snapSection.style.display = "block";
        snapLink.href = `snapchat://add/${data.user.username}`;
      }
    } catch (err) {
      console.error(err);
      showMessage(msg, "Erreur de connexion au serveur.", true);
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
      return showMessage(msg, "Le mot de passe doit contenir au moins 6 caracteres.", true);
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return showMessage(msg, data.error || "Erreur lors de l'inscription.", true);
      }

      showMessage(msg, "Compte cree avec succes ! Redirection...", false);
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      console.error(err);
      showMessage(msg, "Erreur de connexion au serveur.", true);
    }
  });
}

// --- Liens demo (nav, etc.) ---------------------------------------------------
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
