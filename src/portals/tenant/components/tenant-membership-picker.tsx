import { Building2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TenantMembership } from "../types/tenant.types"

type Props = {
  memberships: TenantMembership[]
  selectedTenantId: string
  loading: boolean
  error: string
  continueLabel: string
  onSelect: (tenantId: string) => void
  onContinue: () => void
}

export function TenantMembershipPicker({
  memberships,
  selectedTenantId,
  loading,
  error,
  title,
  continueLabel,
  onSelect,
  onContinue,
}: Props) {
  return (
    <div className="space-y-3">
      {memberships.map((membership) => {
        const selected = selectedTenantId === membership.tenant
        return (
          <button
            key={membership.tenant}
            type="button"
            onClick={() => onSelect(membership.tenant)}
            className={
              "flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-all " +
              (selected
                ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                : "border-border hover:border-primary/40")
            }
          >
            <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <Building2 className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{membership.tenant}</span>
              <span className="mt-1 block text-xs capitalize text-muted-foreground">
                {membership.role.replaceAll("_", " ")}
              </span>
            </span>
            {selected && <CheckCircle2 className="size-5 text-primary" />}
          </button>
        )
      })}

      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
      <Button className="mt-3 w-full" loading={loading} disabled={!selectedTenantId} onClick={onContinue}>
        {continueLabel}
      </Button>
    </div>
  )
}
