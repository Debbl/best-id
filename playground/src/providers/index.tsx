import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      disableTransitionOnChange
      enableSystem
    >
      {children}
    </ThemeProvider>
  )
}
