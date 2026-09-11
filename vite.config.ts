import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => ({
  base:
    process.env.BASE_PATH ||
    loadEnv(mode, process.cwd(), 'BASE_PATH').BASE_PATH ||
    '/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  esbuild: { jsx: 'automatic' },
}));
