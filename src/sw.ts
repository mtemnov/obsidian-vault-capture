/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

// Injected by vite-plugin-pwa at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Share Target: the manifest action points directly at the app root (BASE),
// so Android opens ?title=&text=&url= on index.html directly.
// main.ts reads those params and pre-fills the form — no SW intercept needed.
