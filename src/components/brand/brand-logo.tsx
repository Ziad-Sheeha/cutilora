import fullColorLogo from "@/assets/1-logo-horizontal/cutilora-logo-horizontal-full-color.png"
import darkLogo from "@/assets/1-logo-horizontal/cutilora-logo-horizontal-reversed-for-dark-bg.png"

type BrandLogoProps = { className?: string; imageClassName?: string }

export function BrandLogo({ className = "", imageClassName = "h-10" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img src={fullColorLogo} alt="Cutilora" className={`w-auto object-contain dark:hidden ${imageClassName}`} />
      <img src={darkLogo} alt="Cutilora" className={`hidden w-auto object-contain dark:block ${imageClassName}`} />
    </span>
  )
}
