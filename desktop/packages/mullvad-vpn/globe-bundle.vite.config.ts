/**
 * Vite config standalone pro bundle do globo R3F · embedded no Android via
 * WebView. Sem Electron plugin, sem main process, sem preload. Single-page
 * app que serve apenas `index.html` + `main.tsx` mountando `<GlobeScene>`.
 *
 * Build: `vite build -c globe-bundle.vite.config.ts`
 * Output: `globe-bundle-dist/`
 *
 * Copy do output pra `vpnvu-desktop/android/app/src/main/assets/globe/`.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'globe-bundle'),
  base: './',
  publicDir: path.resolve(__dirname, 'globe-bundle/public'),
  define: {
    global: 'window',
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: path.resolve(__dirname, 'globe-bundle-dist'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Single chunk · simplifica file serving via file://
        inlineDynamicImports: true,
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [react()],
});
