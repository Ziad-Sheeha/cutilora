import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu, SelectMenuContent, SelectMenuItem, SelectMenuTrigger, SelectMenuValue } from "@/components/ui/select-menu"
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
}

function displayLocalNumber(value: string): string {
  const digits = value.replace(/\\D/g, "")
  if (!digits) return ""
  return digits.startsWith("0") ? digits : "0" + digits
}

export function PhoneNumberField({
  id, label, value, phoneCode, onChange, onPhoneCodeChange, placeholder = "010 1234 5678",
  required, disabled, hint,
}: PhoneNumberFieldProps) {
  const [selectedIso, setSelectedIso] = useState(() => phoneCountries.find((country) => country.dial === phoneCode)?.iso ?? "EG")
  const selected = phoneCountries.find((country) => country.iso === selectedIso && country.dial === phoneCode) ?? phoneCountries.find((country) => country.dial === phoneCode) ?? phoneCountries.find((country) => country.iso === "EG") ?? phoneCountries[0]

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}{required && <span className="ms-1 text-destructive">*</span>}</Label>
      <div className="flex min-w-0 gap-2">
        <SelectMenu value={selected.iso} onValueChange={(iso) => { const country = phoneCountries.find((item) => item.iso === iso); if (country) { setSelectedIso(country.iso); onPhoneCodeChange(country.dial) } }}>
          <SelectMenuTrigger aria-label={label + " country calling code"} className="h-11 w-[118px] shrink-0 px-2.5">
            <SelectMenuValue>
              <span className="flex items-center gap-1.5"><span aria-hidden="true">{countryFlag(selected.iso)}</span><span className="font-mono text-xs">{selected.dial}</span></span>
            </SelectMenuValue>
          </SelectMenuTrigger>
          <SelectMenuContent className="max-h-72 w-[min(320px,calc(100vw-32px))]">
            {phoneCountries.map((country) => (
              <SelectMenuItem key={country.iso} value={country.iso}>
                <span className="flex w-full items-center gap-2">
                  <span className="w-6 text-base" aria-hidden="true">{countryFlag(country.iso)}</span>
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{country.dial}</span>
                </span>
              </SelectMenuItem>
            ))}
          </SelectMenuContent>
        </SelectMenu>
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
