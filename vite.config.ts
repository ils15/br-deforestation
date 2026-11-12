import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/br-deforestation/',
  plugins: [tailwindcss(), react()],
  build: {
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom)[\\/]/,
              priority: 2,
            },
            {
              name: 'recharts',
              test: /node_modules[\\/]recharts[\\/]/,
              priority: 1,
            },
            {
              name: 'leaflet',
              test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/,
              priority: 1,
            },
          ],
        },
      },
    },
  },
})