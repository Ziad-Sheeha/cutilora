import { LoaderCircle } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
export function GlobalLoader() {
  const loading = useAppSelector((state) => state.ui.loadingCount > 0)
  if (!loading) return null
  return <div className="fixed inset-x-0 top-0 z-[110] h-1 overflow-hidden bg-primary/15" role="progressbar" aria-label="Loading"><div className="h-full w-1/3 animate-pulse rounded-full bg-primary" /><span className="sr-only"><LoaderCircle className="size-4 animate-spin" /> Loading</span></div>
}
