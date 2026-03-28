import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      https: true, // Enable HTTPS for PWA installation testing on local network
    },
    plugins: [
      tailwindcss(),
      react(),
      mkcert(), // Automatically generate and handle local HTTPS certificates
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'masked-icon.svg', 'logo.jpg', 'icons/*.png'],
        manifest: {
          name: 'Aqooni Digital',
          short_name: 'Aqooni Dig',
          description: 'Aqooni Digital - Management Portal',
          theme_color: '#5b21b6',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true, // Enable PWA in development mode
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-clerk': ['@clerk/clerk-react'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
            'vendor-db': ['@neondatabase/serverless'],
            'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    }
  };
});
