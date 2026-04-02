import { cn } from '~/lib/utils'

import type { ComponentProps } from 'react'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-2 text-sm shadow-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot='input'
      type={type}
      {...props}
    />
  )
}

export { Input }
