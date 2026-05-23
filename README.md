# obsidian-vault-capture

A minimal Android PWA for capturing thoughts, links, and notes directly into an Obsidian vault on Google Drive — as individual Markdown files.

**Live app:** https://mtemnov.github.io/obsidian-vault-capture/

---

## How it works

```
Android Share Sheet → PWA → HTML form POST → Google Apps Script → Google Drive (.md file)
```

1. Share a link or open the PWA, fill in a thought.
2. Hit **Save to vault** — the browser navigates to your private Apps Script endpoint.
3. Apps Script (running as you) creates a `.md` file in your Obsidian vault's Drive folder.
4. Google Drive syncs to Obsidian on desktop.

Access is restricted to your Google account — unauthorized users hit a Google login/permission error and nothing is written.

---

## Setup

### 1. Deploy the Apps Script backend

1. Go to [script.google.com](https://script.google.com) → New project.
2. Paste the contents of `gas/Code.gs`.
3. Replace `REPLACE_WITH_RAW_FOLDER_ID` with the Google Drive folder ID of your vault's `/raw` folder.
4. Click **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Only myself**
5. Copy the Web App URL.

### 2. Add the secret to GitHub

In your GitHub repo → Settings → Secrets and variables → Actions:

- Add secret `VITE_APPS_SCRIPT_URL` = your Web App URL from step 1.

### 3. Enable GitHub Pages

Repo Settings → Pages → Source: **GitHub Actions**.

Push to `main` — the workflow builds and deploys automatically.

### 4. Add icons

Replace the placeholders in `public/icons/` with real PNGs:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Use [realfavicongenerator.net](https://realfavicongenerator.net) or any image editor.

### 5. Install the PWA on Android

Open the live URL in Chrome → three-dot menu → **Add to Home screen**.

To use with the Share Sheet: share any link from another app → choose **Vault Capture**.

---

## Local development

```bash
cp .env.example .env.local
# Edit .env.local and set VITE_APPS_SCRIPT_URL

npm install
npm run dev
```

---

## Architecture notes

- **Form POST (not fetch):** Required so the browser sends cookies and Google can authenticate you as "Only myself."
- **Apps Script URL is not a secret:** Unauthenticated requests just hit a Google login wall. Still stored as a GitHub secret to avoid committing it.
- **One file per capture:** Never appended to a shared inbox file — each save is a unique timestamped `.md`.
- **Share Target:** Declared in the manifest; the service worker routes `/share-target/` back to `index.html` with params, which `main.ts` reads and pre-fills.

---

## Project structure

```
gas/
  Code.gs          — Apps Script backend (deploy this)
  test-form.html   — Local test form for verifying the auth flow

src/
  main.ts          — Form wiring + share-param prefill
  style.css        — Mobile-first dark theme
  sw.ts            — Custom service worker (precaching + share target routing)

.github/
  workflows/
    deploy.yml     — Build and deploy to GitHub Pages on push to main

public/
  icons/           — PWA icons (replace placeholders with real PNGs)
```
