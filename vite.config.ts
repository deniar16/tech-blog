import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Project site: https://deniar16.github.io/tech-blog/
  // Local dev stays at /. GitHub Actions sets GITHUB_ACTIONS=true.
  base: process.env.GITHUB_ACTIONS === "true" ? "/tech-blog/" : "/",
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5199, strictPort: true },
});
