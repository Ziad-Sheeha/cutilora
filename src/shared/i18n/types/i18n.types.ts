import type { Locale } from "@/i18n/messages"
export type { Locale }
export type Direction = "ltr" | "rtl"
export type TranslationDictionary = (typeof import("@/i18n/messages").messages)[Locale]
