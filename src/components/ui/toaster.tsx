import { useEffect } from "react"
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react"
import { dismissToast, type ToastMessage } from "@/store"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: TriangleAlert }
const durations = { success: 3200, error: 4800, info: 3600, warning: 4200 }

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), durations[toast.kind])
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id, toast.kind])

  const Icon = icons[toast.kind]
  const tone = {
    success: "border-emerald-500/25 bg-emerald-500/5 text-emerald-600",
    error: "border-red-500/25 bg-red-500/5 text-red-600",
    warning: "border-amber-500/25 bg-amber-500/5 text-amber-600",
    info: "border-sky-500/25 bg-sky-500/5 text-sky-600",
  }[toast.kind]

  return (
    <div role={toast.kind === "error" ? "alert" : "status"} className="toast-enter pointer-events-auto flex w-full items-start gap-2.5 rounded-xl border bg-card/95 p-3 text-foreground shadow-lg shadow-slate-950/10 backdrop-blur">
      <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13px] font-semibold leading-5">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{toast.description}</p>}
      </div>
      <button type="button" onClick={() => dispatch(dismissToast(toast.id))} aria-label="Dismiss notification" className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><X className="size-3.5" /></button>
    </div>
  )
}

export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts)
  return (
    <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,340px)] flex-col gap-2">
      {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />)}
    </div>
  )
}
