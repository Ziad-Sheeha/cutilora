import { useEffect } from "react"
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react"
import { dismissToast } from "@/store"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: TriangleAlert }
export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts)
  const dispatch = useAppDispatch()
  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => dispatch(dismissToast(toast.id)), 4500))
    return () => timers.forEach(window.clearTimeout)
  }, [toasts, dispatch])
  return <div aria-live="polite" aria-atomic="false" className="fixed end-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
    {toasts.map((toast) => { const Icon = icons[toast.kind]; return <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className="flex gap-3 rounded-xl border bg-card p-4 text-foreground shadow-xl">
      <Icon className={`mt-0.5 size-5 shrink-0 ${toast.kind === "success" ? "text-success" : toast.kind === "error" ? "text-error" : toast.kind === "warning" ? "text-warning" : "text-info"}`} />
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.title}</p>{toast.description && <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>}</div>
      <button type="button" onClick={() => dispatch(dismissToast(toast.id))} aria-label="Dismiss notification"><X className="size-4" /></button>
    </div> }) }
  </div>
}
