import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React ecosystem
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('reselect')) {
              return 'redux-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('@dnd-kit') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Other node_modules go to vendor
            return 'vendor';
          }

          // Feature-based chunks
          if (id.includes('features/tasks')) {
            return 'tasks-feature';
          }
          if (id.includes('components/ui')) {
            return 'ui-components';
          }
          if (id.includes('components/') && !id.includes('ui')) {
            return 'app-components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'reselect',
      'lucide-react'
    ]
  }
})