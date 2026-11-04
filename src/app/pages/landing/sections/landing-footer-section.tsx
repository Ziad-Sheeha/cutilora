import { ArrowUpRight, ArrowUpLeft, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import type { LandingCopy } from "../landing-content"

export function LandingFooterSection({ copy, isArabic }: { copy: LandingCopy; isArabic: boolean }) {
  return (
    <>
    <section className="landing-final-section">
            <div className="landing-final-glow" />
            <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.finalEyebrow}</div>
            <h2>{copy.finalTitle}</h2>
            <p>{copy.finalText}</p>
            <a href="#contact" className="landing-final-link">{copy.explore}{isArabic ? <ArrowUpLeft size={17} /> : <ArrowUpRight size={17} />}</a>
            <Sparkles className="landing-final-sparkle sparkle-one" size={22} />
            <Sparkles className="landing-final-sparkle sparkle-two" size={15} />
          </section>
    
          <footer className="landing-footer">
            <div className="landing-footer-brand"><BrandLogo className="h-9" imageClassName="h-9" /><span>{copy.footer}</span></div>
            <div className="landing-footer-meta"><span>{copy.privacy}</span><span>© {new Date().getFullYear()} Cutilora</span></div>
          </footer>
    </>
  )
}
