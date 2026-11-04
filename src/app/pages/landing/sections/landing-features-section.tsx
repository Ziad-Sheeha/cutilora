import { Activity, CalendarDays, LayoutDashboard, Users, Workflow } from "lucide-react"
import type { LandingCopy } from "../landing-content"

export function LandingFeaturesSection({ copy }: { copy: LandingCopy }) {
  return (
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
  )
}
