import type { InputHTMLAttributes, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TenantFormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: InputHTMLAttributes<HTMLInputElement>["type"]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  min?: string
  max?: string
  step?: string
  autoComplete?: string
  multiline?: boolean
  rows?: number
  trailing?: ReactNode
}

export function TenantFormField({ id, label, value, onChange, type = "text", placeholder, required, disabled, hint, min, max, step, autoComplete, multiline, rows = 3, trailing }: TenantFormFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}{required && <span className="ms-1 text-destructive">*</span>}</Label>
        {trailing}
      </div>
      {multiline
        ? <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} aria-invalid={required && !value.trim() ? true : undefined} disabled={disabled} rows={rows} />
        : type === "date"
          ? <DatePicker value={value} onChange={onChange} placeholder={placeholder ?? "Select date"} minDate={min ? new Date(min) : undefined} maxDate={max ? new Date(max) : undefined} />
          : <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} aria-invalid={required && !value.trim() ? true : undefined} disabled={disabled} min={min} max={max} step={step} autoComplete={autoComplete} />}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  )
}
