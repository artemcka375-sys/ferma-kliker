import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  base: "./",
  build: {
    outDir: "dist-portable",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rollupOptions: {
      input: fileURLToPath(new URL("./portable.html", import.meta.url)),
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "game.js",
        assetFileNames: "game[extname]",
      },
    },
  },
});
