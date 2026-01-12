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
      // Force single React instance
      'react': resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      '@solana-program/token-2022',
      '@solana-program/compute-budget',
      '@solana-program/memo',
      '@solana-program/system',
      '@solana-program/token',
      '@solana/kit',
    ],
    exclude: ['@supanovaapp/sdk'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
