import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/componentes/gestion-producto/producto/**/*.{ts,tsx}',
        'src/componentes/gestion-producto/precios/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/*.d.ts'],
      thresholds: {
        lines: 70,
      },
    },
  },
  server: {
    host: true, // Permite que el servidor sea accesible desde fuera del contenedor
    port: 5173, // Puerto que estás exponiendo en el docker-compose
    watch: {
      usePolling: true, // Necesario para que Vite detecte cambios dentro del contenedor
    },
  },
})
