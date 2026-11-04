import { CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseLocalDate(value?: string) {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}
function formatLocalDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

export function DatePicker({ value, onChange, placeholder, locale = "en", dir = "ltr", minDate, maxDate, className }: {
  value?: string
  onChange: (value: string) => void
  placeholder: string
  locale?: "ar" | "en"
  dir?: "ltr" | "rtl"
  minDate?: Date
  maxDate?: Date
  className?: string
}) {
  const selected = parseLocalDate(value)
  const label = selected
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(selected)
    : placeholder

  return <Popover>
    <PopoverTrigger asChild>
      <Button type="button" variant="outline" className={cn("h-11 w-full justify-start gap-2 px-3 text-start font-normal", !selected && "text-muted-foreground", className)}>
        <CalendarDays className="size-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{label}</span>
        {selected && <span role="presentation" onClick={(event) => { event.stopPropagation(); onChange("") }}><X className="size-3.5 text-muted-foreground hover:text-foreground" /></span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-auto p-0">
      <Calendar selected={selected} onSelect={(date) => onChange(formatLocalDate(date))} locale={locale} dir={dir} minDate={minDate} maxDate={maxDate} />
    </PopoverContent>
  </Popover>
}
