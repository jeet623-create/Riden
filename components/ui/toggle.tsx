'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on)]:bg-accent data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-muted hover:text-muted-foreground',
        outline: 'border border-input bg-transparent hover:bs-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h9 px-2 w-9',
        sm: 'h8 px-1.5 w-8',
        lg: 'h-10 px-2.5 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size }), className)} {...props} />
}

export { Toggle, toggleVariants }
