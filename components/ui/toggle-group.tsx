'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

type ToggleGroupContextType = VariantProps<typeof toggleVariants>
const ToggleGroupContext = React.createContext<ToggleGroupContextType>({ variant: 'default', size: 'default' })

function ToggleGroup({ className, variant, size, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('flex items-center gap-1', className)} {...props}>{children}</ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item className={cn(toggleVariants({ variant: variant || context.variant, size: size || context.size }), className)} {...props}>{children}</ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
