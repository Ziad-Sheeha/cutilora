import { LoaderCircle } from "lucide-react"
import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends SVGProps<SVGSVGElement> {
  label?: string
}

export function Spinner({ className, label = "Loading", ...props }: SpinnerProps) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label={label}>
      <LoaderCircle className={cn("size-5 animate-spin", className)} aria-hidden="true" {...props} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
