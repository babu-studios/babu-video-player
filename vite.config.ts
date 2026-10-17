import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src babu-video-player: blob:";

export default defineConfig({
  root: resolve(__dirname, "renderer"),
  base: "./",
  plugins: [
    react(),
    {
      name: "babu-csp",
      apply: "build",
      transformIndexHtml: (html) =>
        html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`),
    },
  ],
  build: { outDir: resolve(__dirname, "dist-renderer"), emptyOutDir: true },
  server: { port: 5173, strictPort: true },
  test: { root: resolve(__dirname), include: ["tests/**/*.test.ts"] },
});
