/// <reference types="vite/client" />
// obsidian-vault-capture — main entry point
// Wires the GAS URL into the form and pre-fills fields from share params.

const GAS_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

const form = document.getElementById("capture-form") as HTMLFormElement;
const captureMethodInput = document.getElementById("capture-method") as HTMLInputElement;
const urlInput = document.getElementById("url") as HTMLInputElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const sharedTextarea = document.getElementById("shared_text") as HTMLTextAreaElement;
const sharedTextField = document.getElementById("shared-text-field") as HTMLDivElement;
const noGasUrlBanner = document.getElementById("no-gas-url") as HTMLDivElement;

// --- Wire GAS URL ---

if (!GAS_URL) {
  form.classList.add("hidden");
  noGasUrlBanner.classList.remove("hidden");
} else {
  form.action = GAS_URL;
}

// --- Pre-fill from Android Share Target (GET params) ---
// The manifest share_target routes /share-target/?title=&text=&url= back to index.html
// via the SW, so we're always on the same page — just read search params.

const params = new URLSearchParams(window.location.search);
const sharedTitle = params.get("title") ?? "";
const sharedText  = params.get("text")  ?? "";
const sharedUrl   = params.get("url")   ?? "";

if (sharedTitle || sharedText || sharedUrl) {
  captureMethodInput.value = "share";

  if (sharedUrl) {
    urlInput.value = sharedUrl;
  } else if (looksLikeUrl(sharedText)) {
    // Android sometimes puts the URL in "text" instead of "url"
    urlInput.value = sharedText;
  }

  if (sharedTitle) titleInput.value = sharedTitle;

  const extraText = sharedUrl ? sharedText : (looksLikeUrl(sharedText) ? "" : sharedText);
  if (extraText.trim()) {
    sharedTextarea.value = extraText.trim();
    sharedTextField.classList.remove("hidden");
  }

  // Clean up URL bar so Back/reload doesn't re-trigger prefill
  if (window.history.replaceState) {
    window.history.replaceState({}, "", import.meta.env.BASE_URL);
  }
}

// --- Helpers ---

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}
