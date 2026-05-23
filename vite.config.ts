import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const BASE = "/obsidian-vault-capture/";

export default defineConfig({
  base: BASE,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      // Keep the SW minimal — we only need caching + share target routing
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: "auto",
      manifest: {
        name: "Vault Capture",
        short_name: "Capture",
        description: "Quick capture to Obsidian vault via Google Drive",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#1a1a2e",
        theme_color: "#2d6a4f",
        icons: [
          {
            src: BASE + "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: BASE + "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        share_target: {
          action: BASE,
          method: "GET",
          params: {
            title: "title",
            text: "text",
            url: "url",
          },
        },
      },
    }),
  ],
});
