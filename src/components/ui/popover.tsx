import * as PopoverPrimitive from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const Popover = PopoverPrimitive.Popover
export const PopoverTrigger = PopoverPrimitive.PopoverTrigger
export const PopoverAnchor = PopoverPrimitive.PopoverAnchor

export function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: ComponentProps<typeof PopoverPrimitive.PopoverContent>) {
  return (
    <PopoverPrimitive.PopoverPortal>
      <PopoverPrimitive.PopoverContent
        align={align}
        sideOffset={sideOffset}
        className={cn("z-50 w-72 rounded-xl border bg-card p-4 text-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className)}
        {...props}
      />
    </PopoverPrimitive.PopoverPortal>
  )
}
