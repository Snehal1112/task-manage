import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer (only in development)
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
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
          // Core React chunk (most critical)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            // Redux ecosystem
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('reselect')) {
              return 'redux-store';
            }
            // UI libraries
            if (id.includes('@dnd-kit') || id.includes('@radix-ui') || id.includes('class-variance-authority')) {
              return 'ui-framework';
            }
            // Icons (can be lazy loaded)
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Utilities
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            // Other vendor libraries
            return 'vendor';
          }

          // Feature-based code splitting
          if (id.includes('features/tasks')) {
            return 'feature-tasks';
          }
          if (id.includes('features/')) {
            return 'features';
          }

          // Component chunks
          if (id.includes('components/ui')) {
            return 'ui-components';
          }
          if (id.includes('components/') && !id.includes('ui')) {
            return 'app-components';
          }

          // Service layer
          if (id.includes('services/') || id.includes('api')) {
            return 'services';
          }

          // Utilities and hooks
          if (id.includes('lib/') || id.includes('utils/') || id.includes('hooks/')) {
            return 'utils';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? [];
          const _ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      }
    },
    chunkSizeWarningLimit: 400, // Stricter limit
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
        passes: 2,
      },
      mangle: {
        safari10: true,
      }
    },
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'reselect',
      'lucide-react',
      '@dnd-kit/core',
      '@dnd-kit/utilities'
    ],
    exclude: [
      // Exclude large libraries that should be external or lazy loaded
      'lucide-react/dist/esm/icons/*'
    ]
  }
}))