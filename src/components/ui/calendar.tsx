import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  locale?: "ar" | "en"
  dir?: "ltr" | "rtl"
  className?: string
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

export function Calendar({ selected, onSelect, minDate, maxDate, locale = "en", dir = "ltr", className }: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(selected ?? new Date()))
  const labels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { weekday: "short" })
    const sunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + index)))
  }, [locale])
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstDay + 1
    return day > 0 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : undefined
  })
  const monthLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { month: "long", year: "numeric" }).format(month)
  const isBeforeMin = (date: Date) => Boolean(minDate && dateKey(date) < dateKey(minDate))
  const isAfterMax = (date: Date) => Boolean(maxDate && dateKey(date) > dateKey(maxDate))
  const moveMonth = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))

  return <div className={cn("w-[292px] select-none p-3", className)} dir={dir}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => moveMonth(dir === "rtl" ? 1 : -1)} aria-label={locale === "ar" ? "الشهر السابق" : "Previous month"}><ChevronLeft className="size-4 rtl:rotate-180" /></Button>
      <p className="text-sm font-semibold">{monthLabel}</p>
      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => moveMonth(dir === "rtl" ? -1 : 1)} aria-label={locale === "ar" ? "الشهر التالي" : "Next month"}><ChevronRight className="size-4 rtl:rotate-180" /></Button>
    </div>
    <div className="grid grid-cols-7 gap-1">
      {labels.map((label, index) => <span key={index} className="flex h-8 items-center justify-center text-[11px] font-semibold text-muted-foreground">{label}</span>)}
      {cells.map((date, index) => {
        if (!date) return <span key={index} className="h-9" />
        const disabled = isBeforeMin(date) || isAfterMax(date)
        const active = selected ? sameDay(selected, date) : false
        const today = sameDay(new Date(), date)
        return <Button key={dateKey(date)} type="button" size="icon" variant={active ? "default" : "ghost"} disabled={disabled} onClick={() => onSelect?.(date)} className={cn("size-9 rounded-lg p-0 text-xs font-medium", today && !active && "border border-primary/50", !active && "hover:bg-accent")}>{date.getDate()}</Button>
      })}
    </div>
  </div>
}
