import { cn } from '~/lib/utils'

import type { ComponentProps } from 'react'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-36 w-full rounded-3xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot='textarea'
      {...props}
    />
  )
}

export { Textarea }
