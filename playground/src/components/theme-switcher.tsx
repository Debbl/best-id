'use client'

import { LaptopMinimal, MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Button } from '~/components/ui/button'

import { cn } from '~/lib/utils'
import type { ComponentType } from 'react'

type ThemeOption = 'dark' | 'light' | 'system'

const THEME_OPTIONS: Array<{
  icon: ComponentType<{ className?: string }>
  label: string
  value: ThemeOption
}> = [
  {
    icon: SunMedium,
    label: 'Light',
    value: 'light',
  },
  {
    icon: MoonStar,
    label: 'Dark',
    value: 'dark',
  },
  {
    icon: LaptopMinimal,
    label: 'System',
    value: 'system',
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const activeTheme = mounted ? (theme ?? 'system') : 'system'

  return (
    <div className='inline-flex rounded-full border border-border/70 bg-background/75 p-1 shadow-sm backdrop-blur-sm'>
      {THEME_OPTIONS.map(({ icon: Icon, label, value }) => (
        <Button
          key={value}
          aria-label={`Switch to ${label.toLowerCase()} theme`}
          className={cn(
            'rounded-full px-3',
            activeTheme === value && 'shadow-sm',
          )}
          onClick={() => setTheme(value)}
          size='sm'
          type='button'
          variant={activeTheme === value ? 'default' : 'ghost'}
        >
          <Icon className='size-4' />
          <span className='hidden sm:inline'>{label}</span>
        </Button>
      ))}
    </div>
  )
}
