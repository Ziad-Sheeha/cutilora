import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEventHandler } from "react"
import { LoaderCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        destructive: "bg-[var(--cu-danger-action)] text-[var(--cu-danger-foreground)] shadow-sm hover:brightness-95",
        danger: "bg-[var(--cu-danger-action)] text-[var(--cu-danger-foreground)] shadow-sm hover:brightness-95",
        outline: "border border-input bg-background text-foreground shadow-sm hover:bg-muted",
        secondary: "border border-border bg-card text-foreground shadow-sm hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 rounded-lg px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-xl px-5",
        icon: "size-10 shrink-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows progress and disables the button while its action is running. */
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", loading = false, disabled, onClick, children, ...props }, ref) => {
    const [actionLoading, setActionLoading] = useState(false)
    const isLoading = loading || actionLoading

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      const result = onClick?.(event) as unknown
      if (result && typeof (result as PromiseLike<unknown>).then === "function") {
        setActionLoading(true)
        void Promise.resolve(result).then(
          () => setActionLoading(false),
          () => setActionLoading(false),
        )
      }
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
        {...props}
      >
        {isLoading && <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />}
        {!(isLoading && size === "icon") && children}
      </button>
    )
  },
)

Button.displayName = "Button"

export { buttonVariants }
