import { useEffect } from "react"
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

const content = {
  en: {
    navPlatform: "Platform", navSolutions: "Why Cutilora", navSecurity: "Security",
    eyebrow: "THE CLINIC OPERATING SYSTEM",
    headlineA: "Care deserves", headlineB: "better operations.",
    intro: "One beautifully connected workspace for aesthetic clinics. Bring your people, appointments, services and business into focus — without the operational noise.",
    explore: "Explore the platform", trusted: "BUILT FOR MODERN CLINIC TEAMS",
    preview: "YOUR CLINIC, IN CLEAR VIEW", live: "Workspace overview",
    today: "Today's schedule", patients: "Patient experience", revenue: "Business overview",
    appointments: "Appointments", completed: "Completed", pending: "Needs confirmation",
    total: "Total appointments", schedule: "View daily schedule", operational: "Everything in sync",
    sectionEyebrow: "A CALMER WAY TO RUN YOUR CLINIC",
    sectionTitle: "Less admin. More room for care.",
    sectionIntro: "The details that keep a clinic moving, brought together in one considered experience.",
    opsTitle: "Clinic operations, connected",
    opsText: "Keep appointments, services, branches and everyday workflows in one organized place. Your team knows what matters next.",
    peopleTitle: "Your people, working as one",
    peopleText: "Give every team member the right workspace. Keep roles and access clear as your organization grows.",
    insightTitle: "A clearer view of the business",
    insightText: "Bring operational and financial signals closer together, so decisions are grounded in what is happening.",
    securityEyebrow: "BUILT ON CLEAR BOUNDARIES",
    securityTitle: "One platform. The right access at every level.",
    securityText: "Cutilora is designed around the way clinic organizations work — with distinct platform, tenant, clinic and branch contexts. Access belongs where it should, and sensitive operations stay protected.",
    securityPoint1: "Separate platform administration",
    securityPoint2: "Organization-aware workspaces",
    securityPoint3: "Role-based access foundations",
    securityFoot: "Access policies are enforced by the platform API.",
    finalEyebrow: "A BETTER FOUNDATION STARTS HERE",
    finalTitle: "Make space for better care.",
    finalText: "A more considered way to manage the work behind every great clinic experience.",
    footer: "A thoughtful operating foundation for modern aesthetic clinics.",
    platform: "Platform", privacy: "Privacy-minded by design", scroll: "Scroll to explore",
    clinic: "Clinic", platformAdmin: "Platform admin", workspace: "Workspace",
    ready: "All systems organized", upcoming: "Upcoming", treatment: "Treatment", consultation: "Consultation",
    team: "Team", patientsCount: "Patients", branch: "Branches", monthly: "This month",
  },
  ar: {
    navPlatform: "المنصة", navSolutions: "لماذا كيوتيلورا", navSecurity: "الأمان",
    eyebrow: "نظام تشغيل العيادات",
    headlineA: "رعاية أفضل تبدأ", headlineB: "بإدارة أذكى.",
    intro: "مساحة عمل واحدة ومترابطة لعيادات التجميل. اجمع فريقك ومواعيدك وخدماتك وعملياتك في تجربة واضحة ومنظمة، بعيدًا عن فوضى التشغيل اليومية.",
    explore: "اكتشف المنصة", trusted: "مصممة لفرق العيادات الحديثة",
    preview: "عيادتك في صورة أوضح", live: "نظرة عامة على مساحة العمل",
    today: "جدول اليوم", patients: "تجربة المرضى", revenue: "نظرة على الأعمال",
    appointments: "المواعيد", completed: "مكتمل", pending: "بانتظار التأكيد",
    total: "إجمالي المواعيد", schedule: "عرض جدول اليوم", operational: "كل شيء في مكانه",
    sectionEyebrow: "طريقة أكثر هدوءًا لإدارة عيادتك",
    sectionTitle: "إدارة أقل. مساحة أكبر للرعاية.",
    sectionIntro: "كل التفاصيل التي تحافظ على سير العيادة، مجتمعة في تجربة واحدة مدروسة.",
    opsTitle: "عمليات عيادتك، متصلة",
    opsText: "نظّم المواعيد والخدمات والفروع وسير العمل اليومي في مكان واحد، ليعرف كل فرد في فريقك ما الذي يحتاج إلى اهتمامه.",
    peopleTitle: "فريقك يعمل بتناغم",
    peopleText: "امنح كل فرد مساحة العمل المناسبة. وحافظ على وضوح الأدوار والصلاحيات مع نمو مؤسستك.",
    insightTitle: "رؤية أوضح لأعمالك",
    insightText: "قرّب المؤشرات التشغيلية والمالية من بعضها لتصبح قراراتك مبنية على صورة أكثر اكتمالًا.",
    securityEyebrow: "مبنية على حدود واضحة",
    securityTitle: "منصة واحدة. وصلاحيات في مكانها الصحيح.",
    securityText: "صُممت كيوتيلورا لتناسب طريقة عمل مؤسسات العيادات، مع فصل واضح بين المنصة والعميل والعيادة والفرع. كل صلاحية في نطاقها الصحيح، والعمليات الحساسة تظل محمية.",
    securityPoint1: "إدارة مستقلة على مستوى المنصة",
    securityPoint2: "مساحات عمل مرتبطة بمؤسسة العميل",
    securityPoint3: "أساس واضح للصلاحيات حسب الدور",
    securityFoot: "يتم فرض سياسات الوصول من خلال واجهة المنصة الخلفية.",
    finalEyebrow: "بداية أفضل تحتاج إلى أساس أفضل",
    finalTitle: "اترك مساحة أكبر للرعاية.",
    finalText: "طريقة أكثر تنظيمًا لإدارة كل ما يحدث خلف تجربة العيادة المميزة.",
    footer: "أساس تشغيلي مدروس لعيادات التجميل الحديثة.",
    platform: "المنصة", privacy: "الخصوصية في صميم التصميم", scroll: "اكتشف المزيد",
    clinic: "العيادة", platformAdmin: "مدير المنصة", workspace: "مساحة العمل",
    ready: "كل العمليات منظمة", upcoming: "القادمة", treatment: "جلسة علاج", consultation: "استشارة",
    team: "الفريق", patientsCount: "المرضى", branch: "الفروع", monthly: "هذا الشهر",
  },
} as const

export function LandingPage() {
  const { locale, t } = useI18n()
  const copy = content[locale === "ar" ? "ar" : "en"]
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
              <div className="landing-date-chip"><CalendarDays size={13} /> NOV 04, 2026</div>
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
                <div className="landing-chart-foot"><span>01 NOV</span><span>04 NOV</span><span>08 NOV</span></div>
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

      <section className="landing-final-section">
        <div className="landing-final-glow" />
        <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.finalEyebrow}</div>
        <h2>{copy.finalTitle}</h2>
        <p>{copy.finalText}</p>
        <a href="#platform" className="landing-final-link">{copy.explore}{isArabic ? <ArrowUpLeft size={17} /> : <ArrowUpRight size={17} />}</a>
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
