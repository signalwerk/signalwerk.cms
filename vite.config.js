import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import chokidar from 'chokidar';
import { processPageFile, processAllPages } from './build-pages.js';

// Custom plugin to process page files
function pageProcessorPlugin() {
  return {
    name: 'page-processor',
    configureServer(server) {
      // Watch for changes in collections/pages directory during dev
      const watcher = chokidar.watch('collections/pages/**/*.json', {
        ignored: /node_modules/,
        persistent: true
      });

      watcher.on('change', async (filePath) => {
        console.log(`\n📄 Processing changed file: ${filePath}`);
        try {
          await processPageFile(filePath);
          // Trigger HMR
          server.ws.send({
            type: 'full-reload'
          });
        } catch (error) {
          console.error('Failed to process file:', error);
        }
      });

      watcher.on('add', async (filePath) => {
        console.log(`\n📄 Processing new file: ${filePath}`);
        try {
          await processPageFile(filePath);
          server.ws.send({
            type: 'full-reload'
          });
        } catch (error) {
          console.error('Failed to process file:', error);
        }
      });

      // Process all files on initial server start
      console.log('🚀 Processing all pages on server start...');
      processAllPages().catch(console.error);
    },
    
    buildStart() {
      // Process all files during build
      console.log('🔨 Building all pages...');
      return processAllPages();
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    pageProcessorPlugin()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't empty dist since we're putting HTML files there
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    // Serve static files from dist during development
    fs: {
      allow: ['..', 'dist']
    }
  },
  // Add alias for easier imports
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}); 