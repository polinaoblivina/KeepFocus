import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss(),],
    server: {
        proxy: {
            '/api': 'http://localhost:5220',
            '/avatars': 'http://localhost:5220',
            '/hubs': {
                target: 'http://localhost:5220',
                ws: true
            }
        }
    }
})