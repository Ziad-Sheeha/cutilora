import { Menu, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, Outlet } from "react-router"
import { AdminHeader } from "@/portals/clinic/layout/clinic-header"
import { AdminSidebar } from "@/portals/clinic/layout/clinic-sidebar"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useI18n } from "@/i18n/i18n-provider"
type Theme="light"|"dark"
function getInitialTheme():Theme{if(typeof window==="undefined")return "light";return window.localStorage.getItem("cutilora-theme")==="dark"?"dark":"light"}
export function ClinicLayout(){
 const [mobileMenuOpen,setMobileMenuOpen]=useState(false);const [sidebarCollapsed,setSidebarCollapsed]=useState(false);const [theme,setTheme]=useState<Theme>(getInitialTheme);const {t,locale}=useI18n()
 useEffect(()=>{document.documentElement.dataset.theme=theme;window.localStorage.setItem("cutilora-theme",theme)},[theme])
 const toggleTheme=useCallback(()=>setTheme(current=>current==="light"?"dark":"light"),[])
 return <div dir={locale==="ar"?"rtl":"ltr"} className={`min-h-svh bg-background text-foreground lg:grid ${sidebarCollapsed?"lg:grid-cols-[76px_minmax(0,1fr)]":"lg:grid-cols-[260px_minmax(0,1fr)]"}`}><div className="hidden lg:block"><AdminSidebar collapsed={sidebarCollapsed}/></div><div className="min-w-0"><div className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden"><Link to="/" aria-label={t.common.home}><BrandLogo imageClassName="h-7"/></Link><button type="button" onClick={()=>setMobileMenuOpen(open=>!open)} aria-label={mobileMenuOpen?t.common.closeNavigation:t.common.openNavigation} className="flex size-9 items-center justify-center rounded-lg border">{mobileMenuOpen?<X className="size-4"/>:<Menu className="size-4"/>}</button></div>{mobileMenuOpen&&<div className="fixed inset-x-0 bottom-0 top-14 z-40 lg:hidden"><AdminSidebar onNavigate={()=>setMobileMenuOpen(false)}/></div>}<AdminHeader theme={theme} onToggleTheme={toggleTheme} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(collapsed=>!collapsed)}/><main className="mx-auto w-full max-w-[1440px] p-5 sm:p-8"><Outlet/></main><footer className="px-5 pb-6 text-center text-xs text-muted-foreground sm:px-8">{t.common.footerClinic}</footer></div></div>
}
