import { defineConfig } from '@debbl/eslint-config'

export default defineConfig({
  ignores: {
    files: ['playground'],
  },
  typescript: true,
})
