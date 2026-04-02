import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'best-id Playground',
    short_name: 'best-id',
    description:
      'Generate, inspect, and parse typed UUIDv7-based IDs in your browser.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcf7ef',
    theme_color: '#16747c',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
