// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cloud-dancer-v2/',   // ⭐ GitHub Pages용 베이스 경로
});
