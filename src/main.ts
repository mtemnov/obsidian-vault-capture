/// <reference types="vite/client" />
// obsidian-vault-capture — main entry point

const GAS_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

const form          = document.getElementById("capture-form")    as HTMLFormElement;
const captureMethod = document.getElementById("capture-method")  as HTMLInputElement;
const urlInput      = document.getElementById("url")             as HTMLInputElement;
const titleInput    = document.getElementById("title")           as HTMLInputElement;
const thoughtArea   = document.getElementById("thought")         as HTMLTextAreaElement;
const sharedArea    = document.getElementById("shared_text")     as HTMLTextAreaElement;
const sharedField   = document.getElementById("shared-text-field") as HTMLDivElement;
const submitBtn     = document.getElementById("submit-btn")      as HTMLButtonElement;
const gasFrame      = document.getElementById("gas-frame")       as HTMLIFrameElement;
const toast         = document.getElementById("toast")           as HTMLDivElement;
const noGasUrl      = document.getElementById("no-gas-url")      as HTMLDivElement;

// --- Wire GAS URL ---

if (!GAS_URL) {
  form.classList.add("hidden");
  noGasUrl.classList.remove("hidden");
} else {
  form.action = GAS_URL;
}

// --- Hidden-iframe submission ---
// The form targets the hidden iframe so the browser never navigates away.
// Google auth cookies are still sent (same as a full-page POST).

let submitting = false;

form.addEventListener("submit", () => {
  if (!GAS_URL) return;
  submitting = true;
  setLoading(true);
});

gasFrame.addEventListener("load", () => {
  if (!submitting) return; // ignore initial empty-src load
  submitting = false;
  setLoading(false);
  showToast("Saved to vault ✓", "success");
  resetForm();
});

// --- Auto-grow textareas ---

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

[thoughtArea, sharedArea].forEach(el => {
  el.addEventListener("input", () => autoGrow(el));
});

// --- Helpers ---

function setLoading(on: boolean) {
  submitBtn.classList.toggle("loading", on);
  submitBtn.disabled = on;
}

function resetForm() {
  urlInput.value = "";
  titleInput.value = "";
  thoughtArea.value = "";
  thoughtArea.style.height = "";
  sharedArea.value = "";
  sharedField.classList.add("hidden");
  captureMethod.value = "manual";
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string, type: "success" | "error" = "success") {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast toast--${type} toast--visible`;
  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

// --- Pre-fill from Android Share Target (GET params) ---

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

  if (window.history.replaceState) {
    window.history.replaceState({}, "", import.meta.env.BASE_URL);
  }
}

function looksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}
