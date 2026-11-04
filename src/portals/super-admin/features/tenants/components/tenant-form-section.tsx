import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TenantFormSection({ title, description, icon: Icon, children }: { title: string; description: string; icon: React.ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start gap-3 border-b bg-muted/20 px-5 py-4 sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5"/></span>
        <div className="min-w-0"><CardTitle>{title}</CardTitle><CardDescription className="mt-1">{description}</CardDescription></div>
      </CardHeader>
      <CardContent className="grid gap-x-5 gap-y-5 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">{children}</CardContent>
    </Card>
  )
}
