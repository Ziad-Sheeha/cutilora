import { useEffect } from "react"
import { landingContent } from "@/app/pages/landing/landing-content"
import { LandingJourneySection } from "@/app/pages/landing/sections/landing-journey-section"
import { LandingStructureSection } from "@/app/pages/landing/sections/landing-structure-section"
import { LandingFaqSection } from "@/app/pages/landing/sections/landing-faq-section"
import { LandingContactSection } from "@/app/pages/landing/sections/landing-contact-section"
import "@/app/pages/landing/landing-page.css"
import {
  Activity, ArrowUpRight, ArrowUpLeft, CalendarDays, Check, ChevronRight,
  CircleCheck, Clock3, Command, HeartPulse, LayoutDashboard, ShieldCheck,
  Sparkles, Users, Wallet,
  Workflow, Zap,
} from "lucide-react"
import { Link } from "react-router"
import { BrandLogo } from "@/components/brand/brand-logo"
import { LanguageSwitch } from "@/i18n/language-switch"
import { useI18n } from "@/i18n/i18n-provider"

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
            <Link to="/clinic/login" className="landing-login landing-login-clinic">
              <span>{copy.clinic}</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <section className="landing-hero" id="platform">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.eyebrow}</div>
          <h1>
            {copy.headlineA}
            <span>{copy.headlineB}</span>
          </h1>
          <p className="landing-hero-description">{copy.intro}</p>
          <div className="landing-hero-bottom">
            <a href="#why-cutilora" className="landing-primary-cta">
              {copy.explore}
              {isArabic ? <ArrowUpLeft size={17} /> : <ArrowUpRight size={17} />}
            </a>
            <div className="landing-proof">
              <div className="landing-proof-icon"><HeartPulse size={16} /></div>
              <span>{copy.trusted}</span>
            </div>
          </div>
          <div className="landing-scroll-hint">
            <span className="landing-scroll-line" />
            <span>{copy.scroll}</span>
          </div>
        </div>

        <div className="landing-hero-visual" aria-label={copy.preview}>
          <div className="landing-visual-glow" />
          <div className="landing-dashboard">
            <div className="landing-dashboard-top">
              <div className="landing-dashboard-brand">
                <span className="landing-dashboard-mark"><Command size={15} /></span>
                <span>CUTILORA <small>/ {copy.workspace}</small></span>
              </div>
              <div className="landing-dashboard-status"><span />{copy.ready}</div>
            </div>
            <div className="landing-dashboard-heading">
              <div><span>{copy.preview}</span><h2>{copy.live}</h2></div>
              <div className="landing-date-chip"><CalendarDays size={13} /> TODAY</div>
            </div>
            <div className="landing-metric-grid">
              <div className="landing-metric-card">
                <div className="landing-metric-icon purple"><CalendarDays size={16} /></div>
                <span>{copy.appointments}</span><strong>24</strong><small><i /> +12.8% <em>{copy.monthly}</em></small>
              </div>
              <div className="landing-metric-card">
                <div className="landing-metric-icon pink"><Users size={16} /></div>
                <span>{copy.patientsCount}</span><strong>1,284</strong><small><i /> +8.2% <em>{copy.monthly}</em></small>
              </div>
              <div className="landing-metric-card">
                <div className="landing-metric-icon green"><Wallet size={16} /></div>
                <span>{copy.revenue}</span><strong>EGP 86k</strong><small><i /> +16.4% <em>{copy.monthly}</em></small>
              </div>
            </div>
            <div className="landing-dashboard-lower">
              <div className="landing-schedule-card">
                <div className="landing-card-heading"><div><span>{copy.today}</span><strong>{copy.total}</strong></div><span className="landing-card-count">08</span></div>
                <div className="landing-schedule-row">
                  <time>09:30</time><span className="landing-schedule-mark mark-purple" /><div><strong>{copy.treatment}</strong><small>{copy.completed}</small></div><CircleCheck size={15} className="landing-row-check" />
                </div>
                <div className="landing-schedule-row">
                  <time>10:15</time><span className="landing-schedule-mark mark-pink" /><div><strong>{copy.consultation}</strong><small>{copy.pending}</small></div><Clock3 size={15} className="landing-row-clock" />
                </div>
                <div className="landing-schedule-row">
                  <time>11:00</time><span className="landing-schedule-mark mark-blue" /><div><strong>{copy.treatment}</strong><small>{copy.upcoming}</small></div><ChevronRight size={15} className="landing-row-arrow" />
                </div>
              </div>
              <div className="landing-insight-card">
                <div className="landing-card-heading"><div><span>{copy.operational}</span><strong>{copy.revenue}</strong></div><Activity size={17} /></div>
                <div className="landing-chart">
                  <div className="landing-chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
                  <svg viewBox="0 0 220 66" preserveAspectRatio="none" aria-hidden="true">
                    <defs><linearGradient id="landing-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9b7bff" stopOpacity=".3" /><stop offset="100%" stopColor="#9b7bff" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0 52 C18 48 22 34 42 40 S68 52 86 31 S112 37 130 24 S157 34 174 15 S199 20 220 5 L220 66 L0 66Z" fill="url(#landing-chart-fill)" />
                    <path d="M0 52 C18 48 22 34 42 40 S68 52 86 31 S112 37 130 24 S157 34 174 15 S199 20 220 5" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="landing-chart-foot"><span>WEEK 01</span><span>WEEK 04</span><span>WEEK 08</span></div>
              </div>
            </div>
            <div className="landing-dashboard-footer"><span><span className="landing-footer-pulse" />{copy.ready}</span><span> CUTILORA · 2026</span></div>
          </div>

          <div className="landing-float-card landing-float-top">
            <span className="landing-float-icon"><Zap size={15} /></span>
            <span><strong>{copy.operational}</strong><small>{copy.team}</small></span>
            <Check size={15} />
          </div>
          <div className="landing-float-card landing-float-bottom">
            <span className="landing-float-icon float-heart"><HeartPulse size={16} /></span>
            <span><strong>{copy.patients}</strong><small>{copy.branch} · {copy.workspace}</small></span>
          </div>
        </div>
      </section>

      <section className="landing-feature-section" id="why-cutilora">
        <div className="landing-section-heading">
          <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.sectionEyebrow}</div>
          <h2>{copy.sectionTitle}</h2>
          <p>{copy.sectionIntro}</p>
        </div>
        <div className="landing-feature-grid">
          <article className="landing-feature-card feature-card-main">
            <div className="landing-feature-icon"><Workflow size={21} /></div>
            <span className="landing-feature-index">01 / OPERATIONS</span>
            <h3>{copy.opsTitle}</h3>
            <p>{copy.opsText}</p>
            <div className="landing-feature-art art-workflow">
              <span><CalendarDays size={15} /> {copy.appointments}</span><i /><span><LayoutDashboard size={15} /> {copy.workspace}</span><i /><span><Activity size={15} /> {copy.operational}</span>
            </div>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon feature-icon-pink"><Users size={21} /></div>
            <span className="landing-feature-index">02 / PEOPLE</span>
            <h3>{copy.peopleTitle}</h3>
            <p>{copy.peopleText}</p>
            <div className="landing-people-art">
              <span className="people-avatar avatar-one">A</span><span className="people-avatar avatar-two">M</span><span className="people-avatar avatar-three">S</span><span className="people-avatar avatar-four">+</span>
              <div><strong>01</strong><small>{copy.team}</small></div>
            </div>
          </article>
          <article className="landing-feature-card">
            <div className="landing-feature-icon feature-icon-green"><Activity size={21} /></div>
            <span className="landing-feature-index">03 / INSIGHT</span>
            <h3>{copy.insightTitle}</h3>
            <p>{copy.insightText}</p>
            <div className="landing-insight-art"><span>+18.6%</span><div><i /><i /><i /><i /><i /><i /><i /><i /></div><small>{copy.monthly}</small></div>
          </article>
        </div>
      </section>

      <LandingJourneySection copy={copy} />

      <section className="landing-security-section" id="security">
        <div className="landing-security-visual">
          <div className="security-ring security-ring-outer" />
          <div className="security-ring security-ring-inner" />
          <div className="security-core"><ShieldCheck size={38} strokeWidth={1.4} /><span>CUTILORA</span></div>
          <div className="security-node node-platform"><Command size={16} /><span>PLATFORM</span></div>
          <div className="security-node node-tenant"><Workflow size={16} /><span>TENANT</span></div>
          <div className="security-node node-clinic"><HeartPulse size={16} /><span>CLINIC</span></div>
          <div className="security-node node-branch"><LayoutDashboard size={16} /><span>BRANCH</span></div>
        </div>
        <div className="landing-security-copy">
          <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.securityEyebrow}</div>
          <h2>{copy.securityTitle}</h2>
          <p>{copy.securityText}</p>
          <ul>
            {[copy.securityPoint1, copy.securityPoint2, copy.securityPoint3].map((item) => <li key={item}><CircleCheck size={17} />{item}</li>)}
          </ul>
          <div className="landing-security-foot"><ShieldCheck size={15} />{copy.securityFoot}</div>
        </div>
      </section>

      <LandingStructureSection copy={copy} />

      <LandingFaqSection copy={copy} />

      <LandingContactSection copy={copy} />

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
    </main>
  )
}
