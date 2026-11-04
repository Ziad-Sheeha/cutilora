import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { I18nProvider } from "@/i18n/i18n-provider"
import { Toaster } from "@/components/ui/toaster"
import { store } from "@/store"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <I18nProvider>
        {children}
        <Toaster />
      </I18nProvider>
    </Provider>
  )
}
