import * as TooltipPrimitive from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const TooltipProvider = TooltipPrimitive.TooltipProvider
export const Tooltip = TooltipPrimitive.Tooltip
export const TooltipTrigger = TooltipPrimitive.TooltipTrigger

export function TooltipContent({ className, sideOffset = 4, ...props }: ComponentProps<typeof TooltipPrimitive.TooltipContent>) {
  return (
    <TooltipPrimitive.TooltipPortal>
      <TooltipPrimitive.TooltipContent
        sideOffset={sideOffset}
        className={cn("z-50 overflow-hidden rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-md outline-none data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95", className)}
        {...props}
      />
    </TooltipPrimitive.TooltipPortal>
  )
}
