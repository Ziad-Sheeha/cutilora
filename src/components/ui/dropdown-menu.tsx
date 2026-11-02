import * as DropdownMenuPrimitive from "radix-ui"
import { Check, ChevronRight, Circle } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = DropdownMenuPrimitive.DropdownMenu
export const DropdownMenuTrigger = DropdownMenuPrimitive.DropdownMenuTrigger
export const DropdownMenuGroup = DropdownMenuPrimitive.DropdownMenuGroup
export const DropdownMenuPortal = DropdownMenuPrimitive.DropdownMenuPortal
export const DropdownMenuSub = DropdownMenuPrimitive.DropdownMenuSub
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.DropdownMenuRadioGroup

export function DropdownMenuSubTrigger({ className, inset, children, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSubTrigger> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.DropdownMenuSubTrigger className={cn("flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-muted data-[state=open]:bg-muted [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "ps-8", className)} {...props}>
      {children}<ChevronRight className="ms-auto size-4 rtl:rotate-180" aria-hidden="true" />
    </DropdownMenuPrimitive.DropdownMenuSubTrigger>
  )
}

export function DropdownMenuSubContent({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSubContent>) {
  return <DropdownMenuPrimitive.DropdownMenuSubContent className={cn("z-50 min-w-32 overflow-hidden rounded-xl border bg-card p-1 text-foreground shadow-lg", className)} {...props} />
}

export function DropdownMenuContent({ className, sideOffset = 4, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuContent>) {
  return <DropdownMenuPrimitive.DropdownMenuPortal><DropdownMenuPrimitive.DropdownMenuContent sideOffset={sideOffset} className={cn("z-50 min-w-40 overflow-hidden rounded-xl border bg-card p-1 text-foreground shadow-lg", className)} {...props} /></DropdownMenuPrimitive.DropdownMenuPortal>
}

export function DropdownMenuItem({ className, inset, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuItem> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.DropdownMenuItem className={cn("relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", inset && "ps-8", className)} {...props} />
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuCheckboxItem>) {
  return (
    <DropdownMenuPrimitive.DropdownMenuCheckboxItem checked={checked} className={cn("relative flex cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      <span className="absolute start-2 flex size-3.5 items-center justify-center">{checked === "indeterminate" ? <span className="h-0.5 w-2.5 bg-current" /> : checked ? <Check className="size-4" /> : null}</span>{children}
    </DropdownMenuPrimitive.DropdownMenuCheckboxItem>
  )
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuRadioItem>) {
  return (
    <DropdownMenuPrimitive.DropdownMenuRadioItem className={cn("relative flex cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
      <span className="absolute start-2 flex size-3.5 items-center justify-center"><DropdownMenuPrimitive.DropdownMenuItemIndicator><Circle className="size-2 fill-current" /></DropdownMenuPrimitive.DropdownMenuItemIndicator></span>{children}
    </DropdownMenuPrimitive.DropdownMenuRadioItem>
  )
}

export function DropdownMenuLabel({ className, inset, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuLabel> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.DropdownMenuLabel className={cn("px-2 py-1.5 text-sm font-semibold", inset && "ps-8", className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSeparator>) {
  return <DropdownMenuPrimitive.DropdownMenuSeparator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

export function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("ms-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
}
