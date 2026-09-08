import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            const normalizedId = id.replace(/\\/g, '/')
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) {
              return 'vendor-react'
            }
            if (normalizedId.includes('/recharts/')) {
              return 'vendor-charts'
            }
            if (
              normalizedId.includes('/@xyflow/') ||
              normalizedId.includes('/reactflow/') ||
              normalizedId.includes('react-flow')
            ) {
              return 'vendor-flow'
            }
            if (normalizedId.includes('/lucide-react/')) {
              return 'vendor-icons'
            }
          }
        },
      },
    },
  },
})


