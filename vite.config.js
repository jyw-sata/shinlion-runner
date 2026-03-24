import { defineConfig } from 'vite';
export default defineConfig({
  base: '/shinlion-runner/',
  build: { outDir: 'dist' },
  server: { port: 3001, open: true },
});
