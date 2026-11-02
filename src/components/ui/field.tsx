import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}
