'use client'

import { Label } from '~/components/ui/label'
import { VERSION_OPTIONS } from '~/lib/best-id-studio-data'
import { cn } from '~/lib/utils'
import type { BestIdVersion } from '~/lib/best-id'

interface VersionSelectorProps {
  id: string
  label: string
  hintKind: 'accept' | 'generate'
  onChange: (version: BestIdVersion) => void
  value: BestIdVersion
}

export function VersionSelector({
  id,
  label,
  hintKind,
  onChange,
  value,
}: VersionSelectorProps) {
  const activeOption = VERSION_OPTIONS.find((option) => option.value === value)
  const hint =
    hintKind === 'generate'
      ? activeOption?.generateHint
      : activeOption?.acceptHint

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <div
        aria-label={label}
        className='inline-flex h-11 w-full items-center gap-1 rounded-2xl border border-border/70 bg-background/80 p-1 shadow-xs'
        id={id}
        role='radiogroup'
      >
        {VERSION_OPTIONS.map((option) => (
          <button
            aria-checked={option.value === value}
            className={cn(
              'h-full flex-1 rounded-xl px-3 font-mono text-sm font-medium transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              option.value === value
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role='radio'
            type='button'
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>{hint}</p>
    </div>
  )
}
