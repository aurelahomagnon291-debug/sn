import { SNAPCHAT_PROFILE_URL } from "./config.js";

const snapchatLink = document.querySelector("#snapchat-link");
const backButton = document.querySelector("#back-button");

if (SNAPCHAT_PROFILE_URL) {
  snapchatLink.href = SNAPCHAT_PROFILE_URL;
}

backButton.addEventListener("click", () => {
  window.location.href = "./index.html";
});
