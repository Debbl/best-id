import { cn } from '~/lib/utils'

import type { ComponentProps } from 'react'

interface SeparatorProps extends ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical'
}

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border/80',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      data-slot='separator'
      role='separator'
      {...props}
    />
  )
}

export { Separator }
