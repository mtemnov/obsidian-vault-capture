// obsidian-vault-capture — Google Apps Script
// Deploy as: Execute as Me / Who has access: Only myself
//
// Setup: replace REPLACE_WITH_RAW_FOLDER_ID with the Google Drive folder ID
// of your Obsidian vault's /raw folder. Find it in the Drive URL when you
// open the folder: drive.google.com/drive/folders/<THIS_IS_THE_ID>

const DESTINATIONS = {
  raw: {
    label: "AI Brain",
    folderId: "REPLACE_WITH_RAW_FOLDER_ID"
  }
  // v2: personal: { label: "Personal", folderId: "REPLACE_WITH_PERSONAL_FOLDER_ID" }
};

const PWA_URL = "https://mtemnov.github.io/obsidian-vault-capture/";

function doPost(e) {
  try {
    const params = e.parameter;

    const destination = params.destination || "raw";
    if (!DESTINATIONS[destination]) {
      return errorPage("Unknown destination: " + destination);
    }

    const dest = DESTINATIONS[destination];
    const url        = sanitize(params.url        || "");
    const title      = sanitize(params.title      || "");
    const thought    = sanitize(params.thought    || "");
    const sharedText = sanitize(params.shared_text || "");
    const captureMethod = sanitize(params.capture_method || "manual");

    const source = inferSource(url);
    const now    = new Date();
    const iso    = toIsoWithOffset(now);
    const slug   = toFilenameSlug(now);

    const markdown = buildMarkdown({
      created: iso,
      source,
      captureMethod,
      destination,
      url,
      title,
      thought,
      sharedText,
      tags: ["raw", "capture"]
    });

    const filename = slug + ".md";
    const folder   = DriveApp.getFolderById(dest.folderId);
    folder.createFile(filename, markdown, MimeType.PLAIN_TEXT);

    return successPage(dest.label, filename);

  } catch (err) {
    return errorPage("Error: " + err.message);
  }
}

// --- Markdown builder ---

function buildMarkdown(fields) {
  const lines = [
    "---",
    "created: " + fields.created,
    "source: " + fields.source,
    "capture_method: " + fields.captureMethod,
    "destination: " + fields.destination,
  ];

  if (fields.url)   lines.push('url: "' + fields.url + '"');
  if (fields.title) lines.push('title: "' + fields.title + '"');

  lines.push("tags:");
  fields.tags.forEach(function(t) { lines.push("  - " + t); });
  lines.push("---");
  lines.push("");

  if (fields.thought) {
    lines.push("# Thought");
    lines.push("");
    lines.push(fields.thought);
    lines.push("");
  }

  if (fields.url) {
    lines.push("# Resource");
    lines.push("");
    lines.push(fields.url);
    lines.push("");
  }

  if (fields.sharedText) {
    lines.push("# Shared text");
    lines.push("");
    lines.push(fields.sharedText);
    lines.push("");
  }

  return lines.join("\n");
}

// --- Helpers ---

function sanitize(value) {
  return String(value)
    .replace(/"/g, "'")
    .replace(/\r?\n/g, " ")
    .trim();
}

function inferSource(url) {
  try {
    var host = url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
    if (host.indexOf("youtube.com") !== -1 || host === "youtu.be") return "youtube";
    if (host === "") return "web";
    return host.split(".")[0]; // e.g. "reddit", "twitter", "github"
  } catch (e) {
    return "web";
  }
}

function toIsoWithOffset(date) {
  // Apps Script runs in UTC; use the script's timezone for the offset string
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function toFilenameSlug(date) {
  var tz = Session.getScriptTimeZone();
  return Utilities.formatDate(date, tz, "yyyy-MM-dd'T'HH-mm-ss");
}

// --- Response pages ---

function successPage(destLabel, filename) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Saved</title>'
    + '<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:0 20px;text-align:center}'
    + 'h1{color:#2d6a4f;font-size:2rem;margin-bottom:8px}'
    + 'p{color:#555;margin:4px 0}'
    + 'a{display:inline-block;margin-top:24px;padding:12px 24px;background:#2d6a4f;color:#fff;'
    + 'text-decoration:none;border-radius:8px;font-size:1rem}'
    + '</style></head><body>'
    + '<h1>Saved ✓</h1>'
    + '<p>Destination: ' + destLabel + '</p>'
    + '<p>File: ' + filename + '</p>'
    + '<a href="' + PWA_URL + '">← Capture another</a>'
    + '<script>setTimeout(function(){location.href="' + PWA_URL + '"},3000);</script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}

function errorPage(message) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Error</title>'
    + '<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:0 20px;text-align:center}'
    + 'h1{color:#c0392b;font-size:2rem}'
    + 'p{color:#555;word-break:break-word}'
    + 'a{display:inline-block;margin-top:24px;padding:12px 24px;background:#555;color:#fff;'
    + 'text-decoration:none;border-radius:8px;font-size:1rem}'
    + '</style></head><body>'
    + '<h1>Error</h1>'
    + '<p>' + message + '</p>'
    + '<a href="' + PWA_URL + '">← Back</a>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
