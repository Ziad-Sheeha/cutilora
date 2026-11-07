import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  collapsed: boolean
  isArabic: boolean
  onToggleCollapse?: () => void
}

export function TenantSidebarHeader({ collapsed, isArabic, onToggleCollapse }: Props) {
  const toggleLabel = collapsed
    ? (isArabic ? "توسيع القائمة" : "Expand sidebar")
    : (isArabic ? "طي القائمة" : "Collapse sidebar")

  return (
    <>
      <div className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="grid size-10 place-items-center rounded-xl bg-white/[.06] text-violet-200">
                <Sparkles className="size-5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side={isArabic ? "left" : "right"}>Cutilora</TooltipContent>
          </Tooltip>
        ) : (
          <BrandLogo className="dark" imageClassName="h-9" />
        )}
        {onToggleCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                aria-label={toggleLabel}
                className="size-9 text-white/65 hover:bg-white/10 hover:text-white"
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isArabic ? "left" : "right"}>{toggleLabel}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {!collapsed && (
        <div className="shrink-0 px-5 py-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">
            <Sparkles className="size-3.5" />
            CUTILORA
          </div>
          <p className="text-sm font-semibold">{isArabic ? "مساحة المؤسسة" : "Organization workspace"}</p>
          <p className="mt-1 text-xs text-white/45">
            {isArabic ? "إدارة مؤسستك بثقة" : "Run your organization with clarity"}
          </p>
        </div>
      )}
    </>
  )
}
