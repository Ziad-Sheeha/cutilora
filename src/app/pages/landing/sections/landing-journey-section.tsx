import { ArrowUpRight, BarChart3, CalendarCheck, UsersRound } from "lucide-react"
import type { LandingCopy } from "../landing-content"

const steps = [
  { number: "01", icon: CalendarCheck, title: "journeyOneTitle", description: "journeyOneText" },
  { number: "02", icon: UsersRound, title: "journeyTwoTitle", description: "journeyTwoText" },
  { number: "03", icon: BarChart3, title: "journeyThreeTitle", description: "journeyThreeText" },
] as const

export function LandingJourneySection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="landing-journey-section" aria-labelledby="landing-journey-title">
      <div className="landing-section-heading">
        <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.journeyEyebrow}</div>
        <h2 id="landing-journey-title">{copy.journeyTitle}</h2>
        <p>{copy.journeyIntro}</p>
      </div>
      <div className="landing-journey-grid">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <article className="landing-journey-card" key={number}>
            <div className="landing-journey-card-top"><span>{number}</span><Icon size={20} /></div>
            <h3>{copy[title]}</h3>
            <p>{copy[description]}</p>
            <div className="landing-journey-link" aria-hidden="true"><ArrowUpRight size={16} /></div>
          </article>
        ))}
      </div>
    </section>
  )
}
