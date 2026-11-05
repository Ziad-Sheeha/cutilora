import { Select as SelectPrimitive } from "radix-ui"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const SelectMenu = SelectPrimitive.Root
export const SelectMenuGroup = SelectPrimitive.Group
export const SelectMenuValue = SelectPrimitive.Value

export function SelectMenuTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger className={cn("flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild><ChevronDown className="size-4 shrink-0 text-muted-foreground" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectMenuContent({ className, position = "popper", ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content position={position} className={cn("relative z-[9999] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)] max-h-80 overflow-hidden rounded-xl border border-border bg-card p-1 text-foreground shadow-[0_16px_48px_rgba(15,23,42,0.22)] ring-1 ring-black/5 dark:shadow-[0_18px_52px_rgba(0,0,0,0.6)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props}>
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-0.5">{props.children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectMenuItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item className={cn("relative flex w-full cursor-default select-none items-center rounded-lg py-2 ps-3 pe-9 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-2 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="size-4" /></SelectPrimitive.ItemIndicator></span>
    </SelectPrimitive.Item>
  )
}

export function SelectMenuLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-3 py-2 text-xs font-semibold text-muted-foreground", className)} {...props} />
}

export function SelectMenuSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}
