import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TenantFormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
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
        ? <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} disabled={disabled} rows={rows} />
        : <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} disabled={disabled} min={min} max={max} step={step} autoComplete={autoComplete} />}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  )
}
