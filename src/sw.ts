/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

// Injected by vite-plugin-pwa at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// --- Android Share Target handler ---
// The manifest declares share_target action: /obsidian-vault-capture/share-target/
// Android POSTs (GET for url/text/title params) to that URL.
// We intercept it and redirect to the main page so main.ts can read the params.

self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith("/share-target/")) {
    // Preserve the share params, redirect to the app root
    const redirectUrl = new URL(self.location.origin + self.location.pathname.replace(/sw\.js$/, ""));
    redirectUrl.search = url.search; // carry ?title=&text=&url= through

    event.respondWith(
      (async () => {
        // Open / focus the app window with params
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          if ("focus" in client) {
            await (client as WindowClient).navigate(redirectUrl.toString());
            await client.focus();
            return Response.redirect(redirectUrl.toString(), 302);
          }
        }
        // No existing window — open a new one
        if (self.clients.openWindow) {
          await self.clients.openWindow(redirectUrl.toString());
        }
        return Response.redirect(redirectUrl.toString(), 302);
      })()
    );
  }
});
