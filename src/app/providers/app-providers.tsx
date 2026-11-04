import type { ReactNode } from "react"
import { I18nProvider } from "@/i18n/i18n-provider"
import { Toaster } from "@/components/ui/toaster"
export function AppProviders({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}<Toaster /></I18nProvider>
}
