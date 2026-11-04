import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { countryFlag, phoneCountries } from "./phone-country-data"

interface PhoneNumberFieldProps {
  id: string
  label: string
  value: string
  phoneCode: string
  onChange: (value: string) => void
  onPhoneCodeChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  searchPlaceholder?: string
  noCountriesLabel?: string
}

function displayLocalNumber(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return digits.startsWith("0") ? digits : "0" + digits
}

export function PhoneNumberField({
  id, label, value, phoneCode, onChange, onPhoneCodeChange, placeholder = "010 1234 5678",
  required, disabled, hint, searchPlaceholder = "Search country or code...", noCountriesLabel = "No countries found",
}: PhoneNumberFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = phoneCountries.find((country) => country.iso === "EG" && country.dial === phoneCode)
    ?? phoneCountries.find((country) => country.dial === phoneCode)
    ?? phoneCountries.find((country) => country.iso === "EG")!

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return phoneCountries
    return phoneCountries.filter((country) =>
      country.name.toLocaleLowerCase().includes(query)
      || country.iso.toLocaleLowerCase().includes(query)
      || country.dial.includes(query)
    )
  }, [search])

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}{required && <span className="ms-1 text-destructive">*</span>}</Label>
      <div className="flex min-w-0 gap-2">
        <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch("") }}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled} aria-label={label + " country calling code"} aria-expanded={open} className="h-11 w-[124px] shrink-0 justify-between gap-1.5 px-2.5">
              <span className="flex min-w-0 items-center gap-1.5"><span aria-hidden="true">{countryFlag(selected.iso)}</span><span className="font-mono text-xs">{phoneCode}</span></span>
              <ChevronsUpDown className="size-3.5 shrink-0 opacity-50"/>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(340px,calc(100vw-32px))] p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
              <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="h-10 ps-9"/>
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto overscroll-contain">
              {filteredCountries.length ? filteredCountries.map((country) => {
                const active = country.iso === selected.iso
                return <button type="button" key={country.iso} onClick={() => { onPhoneCodeChange(country.dial); setOpen(false); setSearch("") }} className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors hover:bg-muted", active && "bg-primary/10 text-primary")}>
                  <span className="w-6 text-base" aria-hidden="true">{countryFlag(country.iso)}</span>
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{country.dial}</span>
                  {active && <Check className="size-4 shrink-0"/>}
                </button>
              }) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">{noCountriesLabel}</p>}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={displayLocalNumber(value)}
          onChange={(event) => onChange(displayLocalNumber(event.target.value))}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={required && !value.trim() ? true : undefined}
          className="min-w-0 flex-1 font-mono tracking-wide"
        />
      </div>
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  )
}
