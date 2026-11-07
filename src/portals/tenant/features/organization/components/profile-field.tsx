import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileField({ label, value, error, onChange, type = "text", required = false, maxLength }: {
  label: string; value: string; error?: string; onChange: (value: string) => void
  type?: "text" | "email" | "tel" | "url"; required?: boolean; maxLength?: number
}) {
  return <div><Label>{label}{required ? " *" : ""}</Label><Input type={type} value={value} maxLength={maxLength} onChange={event => onChange(event.target.value)} className="mt-2" aria-invalid={Boolean(error)}/>{error && <p className="mt-1 text-xs text-destructive">{error}</p>}</div>
}
