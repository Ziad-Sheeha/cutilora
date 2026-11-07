import { ChevronDown } from "lucide-react"
import { NavLink } from "react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TenantNavGroup, TenantNavItem } from "../../config/navigation"
import { getTenantSidebarGroupIcon } from "./constants"

type Props = {
  groups: TenantNavGroup[]
  labels: Record<string, string>
  isArabic: boolean
  collapsed: boolean
  expandedGroups: Record<string, boolean>
  onToggleGroup: (key: string) => void
  onNavigate?: () => void
}

function TenantSidebarLink({
  item,
  label,
  collapsed,
  isArabic,
  onNavigate,
}: {
  item: TenantNavItem
  label: string
  collapsed: boolean
  isArabic: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={item.href}
          end
          onClick={onNavigate}
          aria-label={label}
          className={({ isActive }) =>
            `group relative flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              isActive
                ? "border-violet-400/45 bg-gradient-to-r from-violet-500/25 to-violet-400/10 text-white shadow-[0_5px_16px_rgba(109,74,255,.16)] before:absolute before:inset-y-2 before:-start-[17px] before:w-[3px] before:rounded-full before:bg-violet-300"
                : "border-transparent bg-transparent text-white/65 shadow-none hover:border-transparent hover:bg-transparent hover:text-white/85"
            } ${collapsed ? "justify-center px-0 before:hidden" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-7 shrink-0 place-items-center rounded-md transition-colors ${isActive ? "bg-violet-400/20 text-violet-100" : "bg-transparent text-white/65"}`}>
                <Icon className="size-[17px] shrink-0" />
              </span>
              {!collapsed && <span className="min-w-0 truncate">{label}</span>}
            </>
          )}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side={isArabic ? "left" : "right"}>{label}</TooltipContent>
    </Tooltip>
  )
}

function CollapsedTenantNavGroup({
  group,
  groupLabel,
  labels,
  isArabic,
  onNavigate,
}: {
  group: TenantNavGroup
  groupLabel: string
  labels: Record<string, string>
  isArabic: boolean
  onNavigate?: () => void
}) {
  const GroupIcon = getTenantSidebarGroupIcon(group.key)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={groupLabel}
              className="w-full rounded-xl text-white/55 hover:bg-white/[.07] hover:text-white"
            >
              <GroupIcon className="size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side={isArabic ? "left" : "right"}>{groupLabel}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent side={isArabic ? "left" : "right"} align="start" className="min-w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{groupLabel}</div>
        {group.items.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <NavLink
              to={item.href}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex w-full items-center gap-2 rounded-lg ${isActive ? "bg-violet-100 font-semibold text-violet-800 focus:bg-violet-100 focus:text-violet-900" : ""}`
              }
            >
              <item.icon className="size-4" />
              <span>{labels[item.key] || item.key}</span>
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
                    collapsed={false}
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
