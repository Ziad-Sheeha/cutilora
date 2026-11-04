import { useState, type FormEvent } from "react"
import { Mail, MessageSquareText, Send } from "lucide-react"
import type { LandingCopy } from "../landing-content"

export function LandingContactSection({ copy }: { copy: LandingCopy }) {
  const [feedback, setFeedback] = useState<"idle" | "missing-config" | "prepared">("idle")
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    if (!contactEmail) {
      setFeedback("missing-config")
      return
    }

    const values = new FormData(form)
    const subject = `Cutilora inquiry — ${String(values.get("organization") || "New organization")}`
    const body = [
      `Name: ${String(values.get("name") || "")}`,
      `Work email: ${String(values.get("email") || "")}`,
      `Clinic / organization: ${String(values.get("organization") || "")}`,
      "",
      String(values.get("message") || ""),
    ].join("\n")

    window.location.href = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setFeedback("prepared")
  }

  return (
    <section className="landing-contact-section" id="contact" aria-labelledby="landing-contact-title">
      <div className="landing-contact-copy">
        <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.contactEyebrow}</div>
        <h2 id="landing-contact-title">{copy.contactTitle}</h2>
        <p>{copy.contactIntro}</p>
        <div className="landing-contact-promise"><span><MessageSquareText size={18} /></span><div><strong>{copy.contactFallback}</strong><small>{copy.contactFallbackText}</small></div></div>
      </div>
      <form className="landing-contact-form" onSubmit={handleSubmit}>
        <div className="landing-contact-form-heading"><span><Mail size={17} /></span><strong>{copy.contactEyebrow}</strong></div>
        <label>{copy.contactName}<input name="name" autoComplete="name" required maxLength={100} placeholder={copy.contactName} /></label>
        <label>{copy.contactEmail}<input name="email" type="email" autoComplete="email" required maxLength={180} placeholder="name@clinic.com" /></label>
        <label>{copy.contactOrganization}<input name="organization" autoComplete="organization" maxLength={140} placeholder={copy.contactOrganization} /></label>
        <label>{copy.contactMessage}<textarea name="message" required rows={4} maxLength={1500} placeholder={copy.contactMessage} /></label>
        <button type="submit" className="landing-contact-submit">{copy.contactSubmit}<Send size={16} /></button>
        {feedback === "missing-config" && <p className="landing-contact-feedback" role="alert">{copy.contactNotConfigured}</p>}
        {feedback === "prepared" && <p className="landing-contact-feedback" role="status">{copy.contactPrepared}</p>}
        <small className="landing-contact-privacy">{copy.contactPrivacy}</small>
      </form>
    </section>
  )
}
