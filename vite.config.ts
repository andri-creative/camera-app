/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import terminal from "vite-plugin-terminal";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
  },
  plugins: [
    terminal({
      console: "terminal",
    }),
    react(),
    legacy(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Camera GPS",
        short_name: "CameraGPS",
        description: "Capture moments with precise location and watermarks",
        theme_color: "#25671E",
        background_color: "#F8F3E1",
        display: "standalone",
        icons: [
          {
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
