// @ts-check
import { defineConfig } from '@debbl/eslint-config'

export default defineConfig({
  typescript: true,
  react: {
    next: true,
    compiler: true,
  },
  tailwindcss: {
    settings: {
      entryPoint: 'src/app/styles/index.css',
    },
  },
})
