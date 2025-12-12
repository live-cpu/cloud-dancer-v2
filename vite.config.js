// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isProd = command === "build" || mode === "production";

  return {
    plugins: [react()],
    base: isProd ? "/cloud-dancer-v2/" : "/",  // ← dev 에서는 "/"
    build: {
      outDir: "docs",
    },
  };
});
