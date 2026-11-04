import { ChevronDown } from "lucide-react"
import type { LandingCopy } from "../landing-content"
import { LandingSectionHeading } from "./landing-section-heading"

const questions = [
  ["faqQ1", "faqA1"],
  ["faqQ2", "faqA2"],
  ["faqQ3", "faqA3"],
  ["faqQ4", "faqA4"],
] as const

export function LandingFaqSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="landing-faq-section" aria-labelledby="landing-faq-title">
      <LandingSectionHeading id="landing-faq-title" eyebrow={copy.faqEyebrow} title={copy.faqTitle} description={copy.faqIntro} />
      <div className="landing-faq-list">
        {questions.map(([question, answer], index) => (
          <details className="landing-faq-item" key={question} open={index === 0}>
            <summary><span>{copy[question]}</span><ChevronDown size={18} /></summary>
            <p>{copy[answer]}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
