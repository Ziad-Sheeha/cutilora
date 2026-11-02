import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "./i18n-provider"
export function LanguageSwitch() {
  const { locale, toggleLocale, t } = useI18n()
  return <Button type="button" variant="ghost" size="sm" onClick={toggleLocale} aria-label={locale === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"} title={t.common.language}><Languages className="size-4" /><span>{t.common.language}</span></Button>
}
