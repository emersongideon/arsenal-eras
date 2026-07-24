import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy /api to the local FastAPI. In production the app reads the JSON
// baked into /public/data (see src/data.ts), so no backend is required at load.
export default defineConfig({
  plugins: [react()],
  // Relative base so the build works both at a domain root (Render/local) and
  // under a GitHub Pages project subpath (username.github.io/repo-name/).
  base: "./",
  server: {
    proxy: { "/api": "http://localhost:8000" },
  },
});
