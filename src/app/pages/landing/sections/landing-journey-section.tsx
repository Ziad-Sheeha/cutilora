import { ArrowUpRight, BarChart3, CalendarCheck, UsersRound } from "lucide-react"
import type { LandingCopy } from "../landing-content"
import { LandingSectionHeading } from "./landing-section-heading"

const steps = [
  { number: "01", icon: CalendarCheck, title: "journeyOneTitle", description: "journeyOneText" },
  { number: "02", icon: UsersRound, title: "journeyTwoTitle", description: "journeyTwoText" },
  { number: "03", icon: BarChart3, title: "journeyThreeTitle", description: "journeyThreeText" },
] as const

export function LandingJourneySection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="landing-journey-section" aria-labelledby="landing-journey-title">
      <LandingSectionHeading id="landing-journey-title" eyebrow={copy.journeyEyebrow} title={copy.journeyTitle} description={copy.journeyIntro} />
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
