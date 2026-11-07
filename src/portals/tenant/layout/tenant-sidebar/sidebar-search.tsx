import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  value: string
  isArabic: boolean
  onChange: (value: string) => void
}

export function TenantSidebarSearch({ value, isArabic, onChange }: Props) {
  return (
    <div className="px-1 pb-1">
      <div className="relative">
        <Search className={`pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-white/35 ${isArabic ? "right-3" : "left-3"}`} />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={isArabic ? "ابحث في القائمة..." : "Search navigation..."}
          aria-label={isArabic ? "ابحث في عناصر القائمة" : "Search navigation"}
          className={`h-10 border-white/10 bg-white/[.06] text-sm text-white placeholder:text-white/35 focus-visible:ring-violet-400 ${isArabic ? "pr-9 pl-9" : "pl-9 pr-9"}`}
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={isArabic ? "مسح البحث" : "Clear search"}
            onClick={() => onChange("")}
            className={`absolute top-1/2 size-7 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white ${isArabic ? "left-1" : "right-1"}`}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
