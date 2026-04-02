import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const configDir = dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
  // eslint-disable-next-line n/prefer-global/process
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: join(configDir, '..'),
  reactCompiler: true,
  trailingSlash: true,
  turbopack: {
    root: join(configDir, '..'),
  },
}

export default withBundleAnalyzer(nextConfig)
