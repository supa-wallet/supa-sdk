import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SupaSDK',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    // Production optimizations
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'production' ? false : true,
    rollupOptions: {
      // Externalize React and Solana optional peer deps
      external: (id) => {
        if (id === 'react' || id.startsWith('react/')) return true;
        if (id === 'react-dom' || id.startsWith('react-dom/')) return true;
        // Bundle compute-budget and token-2022, externalize other Solana packages
        if (id === '@solana-program/compute-budget' || id === '@solana-program/token-2022') return false;
        if (id.startsWith('@solana-program/') || id.startsWith('@solana/')) return true;
        return false;
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        // Prevent code splitting for cleaner bundle
        inlineDynamicImports: true,
      },
    },
  },
}));




