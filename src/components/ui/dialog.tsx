import * as DialogPrimitive from "radix-ui"
import { X } from "lucide-react"
import type { ComponentProps, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Dialog
export const DialogTrigger = DialogPrimitive.DialogTrigger
export const DialogPortal = DialogPrimitive.DialogPortal
export const DialogClose = DialogPrimitive.DialogClose

export function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.DialogOverlay>) {
  return <DialogPrimitive.DialogOverlay className={cn("fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />
}

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.DialogContent>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.DialogContent className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-card p-6 text-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className)} {...props}>
        {children}
        <DialogPrimitive.DialogClose className="absolute end-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.DialogClose>
      </DialogPrimitive.DialogContent>
    </DialogPortal>
  )
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 text-start", className)} {...props} />
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.DialogTitle>) {
  return <DialogPrimitive.DialogTitle className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.DialogDescription>) {
  return <DialogPrimitive.DialogDescription className={cn("text-sm text-muted-foreground", className)} {...props} />
}
