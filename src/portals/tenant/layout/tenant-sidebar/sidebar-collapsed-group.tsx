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
import type { TenantNavGroup } from "../../config/navigation"
import { getTenantSidebarGroupIcon } from "./constants"

type Props = {
  group: TenantNavGroup
  groupLabel: string
  labels: Record<string, string>
  isArabic: boolean
  onNavigate?: () => void
}

export function CollapsedTenantNavGroup({
  group,
  groupLabel,
  labels,
  isArabic,
  onNavigate,
}: Props) {
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
        {group.items.map((item) => {
          const Icon = item.icon
          const label = labels[item.key] || item.key

          return (
            <DropdownMenuItem key={item.key} asChild>
              <NavLink
                to={item.href}
                end
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex w-full items-center gap-2 rounded-lg ${isActive ? "bg-violet-100 font-semibold text-violet-800 focus:bg-violet-100 focus:text-violet-900" : ""}`
                }
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </NavLink>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
