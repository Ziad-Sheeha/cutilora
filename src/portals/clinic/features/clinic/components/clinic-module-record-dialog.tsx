import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import type { ClinicRecord } from "../api/clinic-module.api"
import { clinicModuleColumnLabel, clinicModuleText } from "./clinic-module.i18n"

const internalFields = new Set(["id", "_id", "uuid", "tenantId", "tenant_id", "clinicId", "clinic_id", "branchId", "branch_id"])

function displayValue(value: unknown, locale: "ar" | "en"): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? (locale === "ar" ? "نعم" : "Yes") : (locale === "ar" ? "لا" : "No")
  if (Array.isArray(value)) return value.map((item) => displayValue(item, locale)).join("، ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

type Props = { record: ClinicRecord | null; onOpenChange: (open: boolean) => void }

export function ClinicModuleRecordDialog({ record, onOpenChange }: Props) {
  const { locale } = useI18n()
  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clinicModuleText("details", locale)}</DialogTitle>
          <DialogDescription>{clinicModuleText("scope", locale)}</DialogDescription>
        </DialogHeader>
        {record && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(record).filter(([field]) => !internalFields.has(field)).map(([field, value]) => (
              <div key={field} className="min-w-0 rounded-xl border p-3">
                <dt className="text-xs text-muted-foreground">{clinicModuleColumnLabel(field, locale)}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{displayValue(value, locale)}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{clinicModuleText("close", locale)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
