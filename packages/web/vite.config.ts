/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    // メモリ使用量を削減
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    minify: 'esbuild', // esbuildの方が高速で省メモリ
    rollupOptions: {
      plugins: [
        mode === 'analyze' &&
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }),
      ],
      output: {
        // シンプルなチャンク分割戦略
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'aws-sdk': [
            '@aws-sdk/client-lambda',
            '@aws-sdk/client-kendra',
            '@aws-sdk/client-polly',
            '@aws-sdk/client-transcribe',
            '@aws-sdk/client-transcribe-streaming',
          ],
          'aws-amplify': ['aws-amplify', '@aws-amplify/ui-react'],
          editor: ['@tiptap/react', '@uiw/react-md-editor'],
          charts: ['recharts', 'mermaid'],
          'ui-libs': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@headlessui/react',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    // 事前バンドルの最適化
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@aws-sdk', '@aws-amplify', 'mermaid'], // 大きなライブラリは除外
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  plugins: [
    react(),
    svgr(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    // gzip圧縮のみ（brotliは省略してビルド時間短縮）
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      injectRegister: 'auto',
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        swDest: 'dist/sw.js',
        maximumFileSizeToCacheInBytes: 5000000,
      },
      manifest: {
        name: 'Generative AI Use Cases',
        short_name: 'GenU',
        description:
          'Application Implementation of Business Use Cases Utilizing Generative AI',
        start_url: '/',
        display: 'minimal-ui',
        theme_color: '#232F3E',
        background_color: '#FFFFFF',
        icons: [
          {
            src: '/images/aws_icon_192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/aws_icon_192_maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/images/aws_icon_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/images/aws_icon_512_maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    name: 'use-case-builder',
    root: './tests/use-case-builder',
    environment: 'node',
    setupFiles: [],
  },
}));
