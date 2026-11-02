import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "./i18n-provider"
export function LanguageSwitch(){const {toggleLocale,t}=useI18n();return <Button type="button" variant="ghost" size="sm" onClick={toggleLocale} aria-label={t.common.switchLanguage} title={t.common.switchLanguage}><Languages className="size-4"/><span>{t.common.language}</span></Button>}
