// https://vite.dev/config/
// Garde tes imports d'origine en haut du fichier (defineConfig, react, babel, reactCompilerPreset).
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  // Le proxy ne sert QU'EN DÉVELOPPEMENT (npm run dev).
  // En production, le front appelle directement VITE_API_URL (voir .env.production).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})