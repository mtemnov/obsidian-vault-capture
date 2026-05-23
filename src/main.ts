/// <reference types="vite/client" />
// obsidian-vault-capture — main entry point

const GAS_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

const form          = document.getElementById("capture-form")      as HTMLFormElement;
const captureMethod = document.getElementById("capture-method")    as HTMLInputElement;
const urlInput      = document.getElementById("url")               as HTMLInputElement;
const titleInput    = document.getElementById("title")             as HTMLInputElement;
const thoughtArea   = document.getElementById("thought")           as HTMLTextAreaElement;
const sharedArea    = document.getElementById("shared_text")       as HTMLTextAreaElement;
const sharedField   = document.getElementById("shared-text-field") as HTMLDivElement;
const submitBtn     = document.getElementById("submit-btn")        as HTMLButtonElement;
const noGasUrl      = document.getElementById("no-gas-url")        as HTMLDivElement;

// --- Wire GAS URL ---

if (!GAS_URL) {
  form.classList.add("hidden");
  noGasUrl.classList.remove("hidden");
} else {
  form.action = GAS_URL;
}

// --- Loading state on submit ---
// Page navigates away immediately after, but this gives tactile feedback.

form.addEventListener("submit", () => {
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
});

// --- Auto-grow textareas ---

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

[thoughtArea, sharedArea].forEach(el => {
  el.addEventListener("input", () => autoGrow(el));
});

// --- Pre-fill from Android Share Target (GET params) ---
// manifest share_target action points to /share-target/index.html which
// redirects here with ?title=&text=&url= preserved.

const params      = new URLSearchParams(window.location.search);
const sharedTitle = params.get("title") ?? "";
const sharedText  = params.get("text")  ?? "";
const sharedUrl   = params.get("url")   ?? "";

if (sharedTitle || sharedText || sharedUrl) {
  captureMethod.value = "share";

  if (sharedUrl) {
    urlInput.value = sharedUrl;
  } else if (looksLikeUrl(sharedText)) {
    urlInput.value = sharedText;
  }

  if (sharedTitle) titleInput.value = sharedTitle;

  const extraText = sharedUrl ? sharedText : (looksLikeUrl(sharedText) ? "" : sharedText);
  if (extraText.trim()) {
    sharedArea.value = extraText.trim();
    sharedField.classList.remove("hidden");
    autoGrow(sharedArea);
  }

  // Clean the share params from the URL bar
  if (window.history.replaceState) {
    window.history.replaceState({}, "", import.meta.env.BASE_URL);
  }
}

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}
