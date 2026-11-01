import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// En dev, l'API Node tourne sur :3000 ; en prod c'est Caddy qui fait ce routage.
const api = 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': api,
      '/ws': { target: api, ws: true },
    },
  },
})
