import fullColorLogo from "@/assets/1-logo-horizontal/cutilora-logo-horizontal-full-color.png"
import darkLogo from "@/assets/1-logo-horizontal/cutilora-logo-horizontal-reversed-for-dark-bg.png"

type BrandLogoProps = { className?: string; imageClassName?: string }

export function BrandLogo({ className = "", imageClassName = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img src={fullColorLogo} alt="Cutilora" className={`h-8 w-auto dark:hidden ${imageClassName}`} />
      <img src={darkLogo} alt="Cutilora" className={`hidden h-8 w-auto dark:block ${imageClassName}`} />
    </span>
  )
}
