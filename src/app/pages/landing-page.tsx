import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import { landingContent } from "@/app/pages/landing/landing-content"
import { LandingHeroSection } from "@/app/pages/landing/sections/landing-hero-section"
import { LandingFeaturesSection } from "@/app/pages/landing/sections/landing-features-section"
import { LandingJourneySection } from "@/app/pages/landing/sections/landing-journey-section"
import { LandingSecuritySection } from "@/app/pages/landing/sections/landing-security-section"
import { LandingStructureSection } from "@/app/pages/landing/sections/landing-structure-section"
import { LandingFaqSection } from "@/app/pages/landing/sections/landing-faq-section"
import { LandingContactSection } from "@/app/pages/landing/sections/landing-contact-section"
import { LandingFooterSection } from "@/app/pages/landing/sections/landing-footer-section"
import { BrandLogo } from "@/components/brand/brand-logo"
import { LanguageSwitch } from "@/i18n/language-switch"
import { useI18n } from "@/i18n/i18n-provider"
import "@/app/pages/landing/landing-page.css"

export function LandingPage() {
  const { locale, t } = useI18n()
  const copy = landingContent[locale === "ar" ? "ar" : "en"]
  const isArabic = locale === "ar"

  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = "dark"
    return () => {
      if (previousTheme) document.documentElement.dataset.theme = previousTheme
      else delete document.documentElement.dataset.theme
    }
  }, [])

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="landing-shell dark min-h-svh overflow-hidden bg-background text-foreground">
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link to="/" aria-label={t.common.home} className="landing-brand">
            <BrandLogo className="h-10" imageClassName="h-10" />
          </Link>

          <div className="landing-nav-links">
            <a href="#platform">{copy.navPlatform}</a>
            <a href="#why-cutilora">{copy.navSolutions}</a>
            <a href="#security">{copy.navSecurity}</a>
            <a href="#contact">{copy.contactEyebrow}</a>
          </div>

          <div className="landing-nav-actions">
            <LanguageSwitch />
            <Link to="/super-admin/login" className="landing-login landing-login-admin">
              <ShieldCheck size={15} />
              <span>{copy.platformAdmin}</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/tenant/login" className="landing-login landing-login-clinic">
              <span>{isArabic ? "بوابة المؤسسة" : "Tenant portal"}</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/clinic/login" className="landing-login">
              <span>{copy.clinic}</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <LandingHeroSection copy={copy} isArabic={isArabic} />

      <LandingFeaturesSection copy={copy} />

      <LandingJourneySection copy={copy} />

      <LandingSecuritySection copy={copy} />

      <LandingStructureSection copy={copy} />

      <LandingFaqSection copy={copy} />

      <LandingContactSection copy={copy} />

      <LandingFooterSection copy={copy} isArabic={isArabic} />

      </main>
  )
}
