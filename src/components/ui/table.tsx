import type { HTMLAttributes, TableHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm border-separate border-spacing-0", className)} {...props} /></div>
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b [&_th]:border-b [&_th]:border-border/70", className)} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border/60 transition-colors hover:bg-muted/35 data-[state=selected]:bg-primary/5", className)} {...props} />
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("h-12 px-5 text-start align-middle text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground [&:has([role=checkbox])]:pe-0", className)} {...props} />
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4 align-middle [&:has([role=checkbox])]:pe-0", className)} {...props} />
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}
