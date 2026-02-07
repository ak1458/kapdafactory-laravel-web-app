import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/admin/', // Serve from public_html/admin
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    }
})
