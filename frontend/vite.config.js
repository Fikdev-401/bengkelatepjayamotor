import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const configDir = path.dirname(fileURLToPath(import.meta.url));

function backendPort() {
  try {
    const envFile = fs.readFileSync(path.resolve(configDir, '../backend/.env'), 'utf8');
    const match = /^\s*PORT\s*=\s*(\d+)\s*$/m.exec(envFile);
    return match ? match[1] : '4000';
  } catch {
    return '4000';
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort()}`,
        changeOrigin: true,
      },
    },
  },
});
