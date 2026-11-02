import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { messages, type Locale } from "./messages"
type TranslationDictionary=(typeof messages)[Locale]
type I18nContextValue={locale:Locale;direction:"ltr"|"rtl";setLocale:(locale:Locale)=>void;toggleLocale:()=>void;t:TranslationDictionary}
const I18nContext=createContext<I18nContextValue|null>(null)
function getLocale():Locale{if(typeof window==="undefined")return "en";return window.localStorage.getItem("cutilora-locale")==="ar"?"ar":"en"}
export function I18nProvider({children}:{children:ReactNode}){
 const [locale,setLocaleState]=useState<Locale>(getLocale)
 const setLocale=useCallback((next:Locale)=>setLocaleState(next),[])
 const toggleLocale=useCallback(()=>setLocaleState(current=>current==="ar"?"en":"ar"),[])
 const direction: "ltr" | "rtl" = locale==="ar"?"rtl":"ltr"
 const t=messages[locale]
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;document.documentElement.dataset.locale=locale;window.localStorage.setItem("cutilora-locale",locale)},[locale,direction])
 const value=useMemo(()=>({locale,direction,setLocale,toggleLocale,t}),[locale,direction,setLocale,toggleLocale,t])
 return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
export function useI18n(){const value=useContext(I18nContext);if(!value)throw new Error("useI18n must be used within I18nProvider");return value}
