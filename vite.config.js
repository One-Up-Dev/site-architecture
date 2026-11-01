import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// En dev, l'API Node tourne sur :3000 ; en prod c'est Caddy qui fait ce routage.
const api = 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [vue()],
  server: {
    // xfwd : transmet la vraie IP du visiteur (X-Forwarded-For), comme Caddy en prod
    proxy: {
      '/api': { target: api, xfwd: true },
      '/ws': { target: api, ws: true, xfwd: true },
    },
  },
})
