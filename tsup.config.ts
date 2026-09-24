import { resolve } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'es2023',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }
  },
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      '@xeno-js/vue': resolve(import.meta.dirname, 'src'),
    }
  },
  external: [
    '@sentry/vue',
    '@supabase/supabase-js',
    '@xeno-js/shared',
    'axios',
    'vue',
    'vue-router',
    'zod',
  ],
})