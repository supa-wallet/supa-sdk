import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
) as { version?: string };
const sdkVersion = packageJson.version ?? 'unknown';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'demo/**/*'],
    }),
  ],
  define: {
    global: 'globalThis',
    __SUPA_SDK_VERSION__: JSON.stringify(sdkVersion),
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
        __SUPA_SDK_VERSION__: JSON.stringify(sdkVersion),
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
    rollupOptions: {
      // Externalize React and Solana optional peer deps
      external: (id) => {
        if (id === 'react' || id.startsWith('react/')) return true;
        if (id === 'react-dom' || id.startsWith('react-dom/')) return true;
        // Solana packages are optional peer deps of Privy
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
});



