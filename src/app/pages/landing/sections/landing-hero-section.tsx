import { Activity, ArrowUpRight, ArrowUpLeft, CalendarDays, Check, ChevronRight, CircleCheck, Clock3, Command, HeartPulse, LayoutDashboard, Users, Wallet, Zap } from "lucide-react"
import type { LandingCopy } from "../landing-content"

export function LandingHeroSection({ copy, isArabic }: { copy: LandingCopy; isArabic: boolean }) {
  return (
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
  )
}
