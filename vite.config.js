// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // GitHub Pages용 베이스 경로 (레포 이름과 동일)
  base: "/cloud-dancer-v2/",

  // 빌드 결과를 docs 폴더에 넣어서 Pages에서 바로 쓸 수 있게
  build: {
    outDir: "docs",
  },
});
