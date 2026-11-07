import { NavLink, useLocation } from "react-router"
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
  const { pathname } = useLocation()
  const isActive =
    item.href === "/tenant"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={item.href}
          end
          onClick={onNavigate}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          className={[
            "group relative flex min-h-11 items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
            isActive
              ? "rounded-lg border border-violet-400/45 bg-gradient-to-r from-violet-500/25 to-violet-400/10 text-white shadow-[0_5px_16px_rgba(109,74,255,.16)] before:absolute before:inset-y-2 before:-start-[17px] before:w-[3px] before:rounded-full before:bg-violet-300"
              : "!rounded-none !border-0 !bg-transparent !text-white/65 !shadow-none hover:!bg-transparent hover:!text-white/85",
          ].join(" ")}
        >
          <Icon
            aria-hidden="true"
            className={`size-[17px] shrink-0 ${isActive ? "text-violet-100" : "text-white/65"}`}
          />
          <span className="min-w-0 truncate">{label}</span>
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side={isArabic ? "left" : "right"}>{label}</TooltipContent>
    </Tooltip>
  )
}
