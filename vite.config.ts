import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));
const deskFile = path.join(root, "src/Desk.tsx");
const deskPluginFile = path.join(root, "desk-plugin.ts");

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()];
  if (fs.existsSync(deskPluginFile)) {
    const { deskPlugin } = await import("./desk-plugin");
    plugins.push(deskPlugin());
  }
  const inDocker = Boolean(process.env.DESK_HOST);
  return {
    // Project site: https://deniar16.github.io/tech-blog/
    // Local dev stays at /. GitHub Actions sets GITHUB_ACTIONS=true.
    base: process.env.GITHUB_ACTIONS === "true" ? "/tech-blog/" : "/",
    plugins,
    resolve: {
      alias: {
        "@desk": fs.existsSync(deskFile) ? deskFile : path.join(root, "src/write-desk.tsx"),
      },
    },
    server: {
      host: process.env.DESK_HOST || "127.0.0.1",
      port: 5199,
      strictPort: true,
      watch: inDocker ? { usePolling: true, interval: 300 } : undefined,
      hmr: inDocker ? { host: "127.0.0.1", clientPort: 5199 } : undefined,
    },
  };
});
