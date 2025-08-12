/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
// import viteCompression from 'vite-plugin-compression'; // メモリ節約のため無効化

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // 開発サーバーの最適化
  server: {
    // ネットワーク経由でアクセス可能にする
    host: '0.0.0.0',
    // ファイルシステムの厳密モードを無効化（パフォーマンス向上）
    fs: {
      strict: false,
    },
    // HMRを最適化
    hmr: {
      overlay: false, // エラーオーバーレイを無効化してメモリ節約
    },
    // プリトランスフォームでよく使うファイルを事前に処理
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/*.tsx',
        './src/components/**/*.tsx',
      ],
    },
  },
  build: {
    // メモリ使用量を大幅に削減
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    // ワーカー数を制限してメモリを節約
    cssMinify: 'esbuild',
    reportCompressedSize: false, // gzip計測を無効化
    rollupOptions: {
      plugins: [
        mode === 'analyze' &&
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            gzipSize: false, // メモリ節約のため無効化
            brotliSize: false,
          }),
      ],
      onwarn(warning, warn) {
        // "use client" ディレクティブの警告を無視
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        // PURE注釈の警告も無視
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          warning.message.includes('/*#__PURE__*/')
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        // Vite 7用の最適化されたチャンク分割
        manualChunks: {
          // Reactエコシステム
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // AWS SDK（主要なもののみ）
          'aws-core': [
            '@aws-sdk/client-lambda',
            '@aws-sdk/client-kendra',
            '@aws-sdk/client-cognito-identity',
          ],
          'aws-media': [
            '@aws-sdk/client-polly',
            '@aws-sdk/client-transcribe',
            '@aws-sdk/client-transcribe-streaming',
          ],

          // Amplify
          'aws-amplify': ['aws-amplify', '@aws-amplify/ui-react'],

          // エディタ
          editor: ['@tiptap/react', '@uiw/react-md-editor', 'novel'],

          // 可視化
          visualization: ['recharts', 'mermaid'],

          // UI ライブラリ
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@headlessui/react',
          ],

          // アイコン
          icons: ['react-icons'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // 外部化して処理を軽量化
      external: [],
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
  optimizeDeps: {
    // 開発時の依存関係の事前バンドルを最適化
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'immer',
      'axios',
      'i18next',
      'react-i18next',
      // AWS Amplifyも事前バンドルに含める
      'aws-amplify',
      '@aws-amplify/ui-react',
      // AWS SDK関連のモジュールを明示的に含める
      '@aws-crypto/crc32',
      '@aws-crypto/sha256-js',
      '@aws-sdk/protocol-http',
      '@aws-sdk/signature-v4',
    ],
    exclude: [
      'mermaid',
      'recharts',
      '@tiptap',
      '@uiw/react-md-editor',
      'novel',
    ],
    esbuildOptions: {
      target: 'es2020',
      // メモリ使用量を削減
      keepNames: true,
      treeShaking: true,
    },
    // より積極的な依存関係の検出を無効化してメモリ節約
    entries: [],
    force: false,
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
    // CommonJSモジュールの解決を改善
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
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
    // compressionプラグインをコメントアウト（メモリ節約）
    // viteCompression({
    //   verbose: false,
    //   disable: false,
    //   threshold: 10240,
    //   algorithm: 'gzip',
    //   ext: '.gz',
    // }),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      injectRegister: 'auto',
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html}'], // 画像を除外してメモリ節約
        swDest: 'dist/sw.js',
        maximumFileSizeToCacheInBytes: 3000000, // サイズ制限を削減
        runtimeCaching: [], // 実行時キャッシュを無効化
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
