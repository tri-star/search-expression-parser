import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {},
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
