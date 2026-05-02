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
    const msg = document.querySelector("#login-message");
    const identifier = loginForm.identifier.value.trim();
    const password = loginForm.password.value;

    if (!identifier || !password) {
      return showMessage(msg, "Veuillez remplir tous les champs.", true);
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return showMessage(msg, data.error || data.detail, true);
      }

      showMessage(msg, data.message, false);

      // Afficher le bouton pour ouvrir l'app Snapchat
      const snapSection = document.querySelector("#snapchat-app-section");
      const snapLink = document.querySelector("#snapchat-app-link");
      if (snapSection && snapLink && data.user) {
        snapSection.style.display = "block";
        // Lien pour ouvrir l'app Snapchat avec le profil
        snapLink.href = `snapchat://add/${data.user.username}`;
      }
    } catch {
      showMessage(msg, "Erreur de connexion au serveur.", true);
    }
  });
}

// --- Formulaire d'inscription -------------------------------------------------
const registerForm = document.querySelector("#register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.querySelector("#register-message");
    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    if (!username || !email || !password) {
      return showMessage(msg, "Veuillez remplir tous les champs.", true);
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return showMessage(msg, data.error || data.detail, true);
      }

      showMessage(msg, data.message + " Redirection...", false);
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch {
      showMessage(msg, "Erreur de connexion au serveur.", true);
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
