import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { videoMimePlugin } from './vite-plugin-video-mime.js'

export default defineConfig({
  plugins: [react(), videoMimePlugin()],
  base: '/', // Use root for local development
  // Force no caching in development
  optimizeDeps: {
    force: true
  },
  // Ensure proper MIME types for video files
  assetsInclude: ['**/*.mp4', '**/*.mp3'],
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..']
    },
    // Add middleware to handle OAuth redirects from /videotutor/
    middlewareMode: false,
    proxy: {
      '/videotutor': {
        target: 'http://localhost:5173',
        rewrite: (path) => {
          // If path contains OAuth tokens, redirect to root with tokens
          if (path.includes('#access_token=')) {
            return '/' + path.substring(path.indexOf('#'))
          }
          return '/'
        }
      },
      // Proxy for Manim server
      '/api/manim': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/manim/, '')
      },
      // Proxy for new Manim server v2
      '/api/v2/manim': {
        target: 'http://localhost:5006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v2\/manim/, '')
      }
    }
  },
  publicDir: 'public',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envDir: '.' // Ensure .env is loaded from project root
})