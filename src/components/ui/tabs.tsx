import { Tabs as TabsPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("inline-flex h-11 items-center justify-start gap-1 rounded-xl border bg-card p-1 text-muted-foreground", className)} {...props} />
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-4 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:text-foreground data-[state=active]:hover:text-primary-foreground", className)} {...props} />
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />
}
