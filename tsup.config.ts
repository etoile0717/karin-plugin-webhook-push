import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist'
  },
  {
    entry: ['src/web/web.config.ts'],
    format: ['esm'],
    dts: false,
    sourcemap: true,
    outDir: 'dist'
  }
]);
