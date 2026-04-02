import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import { cn } from '~/lib/utils'
import { Providers } from '~/providers'

import './styles/index.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const metadataBase = new URL('https://best-id.aiwan.run')

export const metadata: Metadata = {
  metadataBase,
  title: 'best-id Playground',
  description:
    'Generate, inspect, and parse typed IDs backed by UUIDv7 and fixed-width Base62.',
  appleWebApp: {
    title: 'best-id Playground',
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      url: '/favicon-96x96.png',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
    {
      rel: 'shortcut icon',
      url: '/favicon.ico',
    },
    {
      rel: 'app-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
  ],
  openGraph: {
    title: 'best-id Playground',
    description:
      'An interactive playground for generating and parsing typed UUIDv7-based IDs.',
    siteName: 'best-id Playground',
    images: [{ url: '/opengraph-image' }],
  },
}

const sans = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const mono = IBM_Plex_Mono({
  weight: ['400', '500', '700'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
})

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={cn(sans.variable, mono.variable)}
      suppressHydrationWarning
    >
      <body className='min-h-full bg-background text-foreground antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
