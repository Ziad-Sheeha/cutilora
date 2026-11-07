import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  collapsed: boolean
  isArabic: boolean
  onSignOut: () => void
}

export function TenantSidebarFooter({ collapsed, isArabic, onSignOut }: Props) {
  return (
    <div className={`shrink-0 border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "md"}
            className={`text-white/65 hover:bg-white/10 hover:text-white ${collapsed ? "" : "w-full justify-start"}`}
            onClick={onSignOut}
          >
            <LogOut className="size-4" />
            {!collapsed && (isArabic ? "تسجيل الخروج" : "Sign out")}
          </Button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side={isArabic ? "left" : "right"}>
            {isArabic ? "تسجيل الخروج" : "Sign out"}
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
}
