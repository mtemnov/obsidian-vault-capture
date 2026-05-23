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
  var style = '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:system-ui,-apple-system,sans-serif;background:#0f0f11;color:#ececec;'
    + 'min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'padding:24px;text-align:center}'
    + '.icon{font-size:3rem;margin-bottom:16px}'
    + 'h1{font-size:1.4rem;font-weight:700;color:#3ecf8e;margin-bottom:8px}'
    + 'p{font-size:0.85rem;color:#6b6b7b;margin:4px 0}'
    + '.file{font-family:monospace;font-size:0.78rem;color:#9898a8;margin-top:8px;'
    + 'background:#18181d;padding:6px 12px;border-radius:6px;display:inline-block}'
    + '.bar{position:fixed;bottom:0;left:0;height:3px;background:#3ecf8e;'
    + 'animation:shrink 1.5s linear forwards}'
    + '@keyframes shrink{from{width:100%}to{width:0}}'
    + '</style>';
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="theme-color" content="#0f0f11">'
    + '<title>Saved</title>' + style + '</head><body>'
    + '<div class="icon">✓</div>'
    + '<h1>Saved to vault</h1>'
    + '<p>' + destLabel + '</p>'
    + '<p class="file">' + filename + '</p>'
    + '<div class="bar"></div>'
    + '<script>setTimeout(function(){location.replace("' + PWA_URL + '")},1500);</script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}

function errorPage(message) {
  var style = '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:system-ui,-apple-system,sans-serif;background:#0f0f11;color:#ececec;'
    + 'min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'padding:24px;text-align:center}'
    + '.icon{font-size:3rem;margin-bottom:16px}'
    + 'h1{font-size:1.4rem;font-weight:700;color:#f87171;margin-bottom:12px}'
    + 'p{font-size:0.88rem;color:#9898a8;word-break:break-word;max-width:360px}'
    + 'a{display:inline-block;margin-top:24px;padding:12px 24px;background:#18181d;color:#ececec;'
    + 'text-decoration:none;border-radius:10px;font-size:0.95rem;border:1px solid rgba(255,255,255,0.07)}'
    + '</style>';
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<meta name="theme-color" content="#0f0f11">'
    + '<title>Error</title>' + style + '</head><body>'
    + '<div class="icon">✗</div>'
    + '<h1>Something went wrong</h1>'
    + '<p>' + message + '</p>'
    + '<a href="' + PWA_URL + '">← Back</a>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
