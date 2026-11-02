import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { en, ar } from "./messages"
import type { Direction, Locale } from "./types/i18n.types"
type Dictionary = typeof en
type I18nContextValue = { locale: Locale; direction: Direction; t: Dictionary; setLocale: (locale: Locale) => void; toggleLocale: () => void }
const I18nContext = createContext<I18nContextValue | null>(null)
const STORAGE_KEY = "cutilora.locale"
function getInitialLocale(): Locale { if (typeof window === "undefined") return "en"; return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en" }
export function I18nProvider({ children }: { children: ReactNode }) {
 const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
 const setLocale = useCallback((next: Locale) => setLocaleState(next), [])
 const toggleLocale = useCallback(() => setLocaleState((current) => current === "en" ? "ar" : "en"), [])
 const t = locale === "ar" ? ar : en
 const direction: Direction = locale === "ar" ? "rtl" : "ltr"
 useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = direction; window.localStorage.setItem(STORAGE_KEY, locale) }, [locale, direction])
 const value = useMemo(() => ({ locale, direction, t, setLocale, toggleLocale }), [locale, direction, t, setLocale, toggleLocale])
 return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n() { const value = useContext(I18nContext); if (!value) throw new Error("useI18n must be used within I18nProvider"); return value }
