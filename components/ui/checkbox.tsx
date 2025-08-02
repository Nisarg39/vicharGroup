"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary border-[1px] sm:border-[1.5px] md:border-2 relative bg-white [&[data-state=checked]_.grey-tick]:hidden",
      className
    )}
    {...props}
  >
    {/* Grey tick indicator - only visible when unchecked */}
    <div className="grey-tick absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
      <Check className="h-3 w-3" strokeWidth={3} />
    </div>
    {/* Checked state indicator - appears on top when checked */}
    <CheckboxPrimitive.Indicator
      className={cn("absolute inset-0 flex items-center justify-center text-current z-10")}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
