import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'
import type { VariantProps } from 'class-variance-authority'

import type { ComponentProps } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background/70 text-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      className={cn(badgeVariants({ className, variant }))}
      data-slot='badge'
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
