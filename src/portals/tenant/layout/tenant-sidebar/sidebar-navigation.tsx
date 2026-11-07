import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TenantNavGroup } from "../../config/navigation"
import { getTenantSidebarGroupIcon } from "./constants"
import { CollapsedTenantNavGroup } from "./sidebar-collapsed-group"
import { TenantSidebarLink } from "./sidebar-link"

type Props = {
  groups: TenantNavGroup[]
  labels: Record<string, string>
  isArabic: boolean
  collapsed: boolean
  expandedGroups: Record<string, boolean>
  onToggleGroup: (key: string) => void
  onNavigate?: () => void
}

export function TenantSidebarNavigation({
  groups,
  labels,
  isArabic,
  collapsed,
  expandedGroups,
  onToggleGroup,
  onNavigate,
}: Props) {
  if (groups.length === 0) {
    return (
      <p className="px-3 py-8 text-center text-xs text-white/45">
        {isArabic ? "مفيش نتائج مطابقة" : "No navigation results"}
      </p>
    )
  }

  return (
    <>
      {groups.map((group) => {
        const GroupIcon = getTenantSidebarGroupIcon(group.key)
        const groupLabel = group.label[isArabic ? "ar" : "en"]
        const isOpen = expandedGroups[group.key] ?? false

        if (collapsed) {
          return (
            <CollapsedTenantNavGroup
              key={group.key}
              group={group}
              groupLabel={groupLabel}
              labels={labels}
              isArabic={isArabic}
              onNavigate={onNavigate}
            />
          )
        }

        return (
          <section key={group.key} className="relative">
            <Button
              variant="ghost"
              onClick={() => onToggleGroup(group.key)}
              aria-expanded={isOpen}
              className={`group mb-2 flex h-10 w-full items-center justify-between rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[.16em] transition-colors hover:bg-white/[.045] ${isOpen ? "text-violet-200" : "text-white/45 hover:text-white/75"}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${isOpen ? "bg-violet-500/15 text-violet-300" : "bg-white/[.045] text-white/40 group-hover:text-white/70"}`}>
                  <GroupIcon className="size-4" />
                </span>
                <span className="truncate">{groupLabel}</span>
              </span>
              <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-300" : "text-white/35"}`} />
            </Button>
            {isOpen && (
              <div className="ms-[22px] space-y-1 border-s border-white/[.13] pb-2 ps-3">
                {group.items.map((item) => (
                  <TenantSidebarLink
                    key={item.key}
                    item={item}
                    label={labels[item.key] || item.key}
                    isArabic={isArabic}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </>
  )
}
