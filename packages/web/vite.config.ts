/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [
        mode === 'analyze' &&
          visualizer({
            open: true,
            filename: 'dist/stats.html',
          }),
      ],
      onwarn(warning, warn) {
        // "use client" ディレクティブの警告を無視
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'aws-sdk': [
            '@aws-sdk/client-lambda',
            '@aws-sdk/client-kendra',
            '@aws-sdk/client-cognito-identity',
            '@aws-sdk/client-polly',
            '@aws-sdk/client-transcribe',
            '@aws-sdk/client-transcribe-streaming',
          ],
          'aws-amplify': ['aws-amplify', '@aws-amplify/ui-react'],
          editor: ['@tiptap/react', '@uiw/react-md-editor', 'novel'],
          visualization: ['recharts', 'mermaid'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'aws-amplify',
      '@aws-amplify/ui-react',
      '@aws-crypto/crc32',
      '@aws-crypto/sha256-js',
    ],
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
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      injectRegister: 'auto',
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html}'],
        swDest: 'dist/sw.js',
        maximumFileSizeToCacheInBytes: 3000000,
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
