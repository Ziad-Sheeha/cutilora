import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { store } from "@/store"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLoader } from "@/components/ui/global-loader"

export function AppProviders({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}<GlobalLoader /><Toaster /></Provider>
}
