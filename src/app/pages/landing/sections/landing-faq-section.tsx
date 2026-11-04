import { ChevronDown } from "lucide-react"
import type { LandingCopy } from "../landing-content"

const questions = [
  ["faqQ1", "faqA1"],
  ["faqQ2", "faqA2"],
  ["faqQ3", "faqA3"],
  ["faqQ4", "faqA4"],
] as const

export function LandingFaqSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="landing-faq-section" aria-labelledby="landing-faq-title">
      <div className="landing-section-heading">
        <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.faqEyebrow}</div>
        <h2 id="landing-faq-title">{copy.faqTitle}</h2>
        <p>{copy.faqIntro}</p>
      </div>
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
