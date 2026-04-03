import { cn } from '~/lib/utils'

import type { ComponentProps } from 'react'

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/70 bg-card/80 text-card-foreground shadow-sm backdrop-blur-sm',
        className,
      )}
      data-slot='card'
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-6', className)}
      data-slot='card-header'
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-lg font-semibold tracking-tight', className)}
      data-slot='card-title'
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm leading-6 text-muted-foreground', className)}
      data-slot='card-description'
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-6 pb-6', className)}
      data-slot='card-content'
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-3 px-6 pb-6', className)}
      data-slot='card-footer'
      {...props}
    />
  )
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
