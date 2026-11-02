import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { messages, type Locale } from "./messages"
type TranslationDictionary = (typeof messages)[Locale]
type I18nContextValue = { locale: Locale; direction: "ltr" | "rtl"; setLocale: (locale: Locale) => void; toggleLocale: () => void; t: TranslationDictionary }
const I18nContext = createContext<I18nContextValue | null>(null)
function getLocale(): Locale { return window.localStorage.getItem("cutilora-locale") === "ar" ? "ar" : "en" }
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale)
  const setLocale = (next: Locale) => { setLocaleState(next); window.localStorage.setItem("cutilora-locale", next) }
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"; document.documentElement.dataset.locale = locale }, [locale])
  const value = useMemo(() => ({ locale, direction: locale === "ar" ? "rtl" as const : "ltr" as const, setLocale, toggleLocale: () => setLocale(locale === "ar" ? "en" : "ar"), t: messages[locale] }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() { const value = useContext(I18nContext); if (!value) throw new Error("useI18n must be used within I18nProvider"); return value }
