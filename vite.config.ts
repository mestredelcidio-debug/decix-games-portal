import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // Configuração de base para GitHub Pages:
    // Suporta domínio personalizado na raiz ('/') ou subpasta de repositório ('./' ou '/nome-do-repo/')
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'github-pages-spa-fallback',
        closeBundle() {
          try {
            const distPath = path.resolve(__dirname, 'dist');
            const indexPath = path.join(distPath, 'index.html');
            const notFoundPath = path.join(distPath, '404.html');
            if (fs.existsSync(indexPath)) {
              fs.copyFileSync(indexPath, notFoundPath);
            }
          } catch {
            // Em caso de falha silenciosa
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

