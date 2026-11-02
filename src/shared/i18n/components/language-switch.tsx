import { memo } from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "../i18n-provider"
export const LanguageSwitch = memo(function LanguageSwitch() { const { locale, toggleLocale, t } = useI18n(); return <Button type="button" variant="ghost" size="sm" onClick={toggleLocale} aria-label={t.common.language.switch}><Languages className="size-4" />{locale === "en" ? t.common.language.arabic : t.common.language.english}</Button> })
