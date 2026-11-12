import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/br-deforestation/',
  plugins: [react()],
  build: {
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
          ],
        },
      },
    },
  },
})