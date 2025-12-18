import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@walletino/sdk': resolve(__dirname, '../src/index.ts'),
      // Важно: использовать одну копию React
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': resolve(__dirname, './node_modules/react/jsx-runtime'),
      // Buffer comes from SDK dependencies
    },
    dedupe: ['react', 'react-dom', '@privy-io/react-auth'],
  },
  optimizeDeps: {
    include: [
      '@solana/kit',
      '@solana-program/memo',
      '@solana-program/system',
      '@solana-program/token',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
});

