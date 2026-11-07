import { NavLink } from "react-router"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TenantNavItem } from "../../config/navigation"

type Props = {
  item: TenantNavItem
  label: string
  isArabic: boolean
  onNavigate?: () => void
}

export function TenantSidebarLink({ item, label, isArabic, onNavigate }: Props) {
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
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`grid size-7 shrink-0 place-items-center rounded-md transition-colors ${isActive ? "bg-violet-400/20 text-violet-100" : "bg-transparent text-white/65"}`}>
                <Icon className="size-[17px] shrink-0" />
              </span>
              <span className="min-w-0 truncate">{label}</span>
            </>
          )}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side={isArabic ? "left" : "right"}>{label}</TooltipContent>
    </Tooltip>
  )
}
