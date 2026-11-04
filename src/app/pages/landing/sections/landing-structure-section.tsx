import { Building2, Building, Network, ShieldCheck } from "lucide-react"
import type { LandingCopy } from "../landing-content"

export function LandingStructureSection({ copy }: { copy: LandingCopy }) {
  return (
    <section className="landing-structure-section" aria-labelledby="landing-structure-title">
      <div className="landing-structure-copy">
        <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{copy.structureEyebrow}</div>
        <h2 id="landing-structure-title">{copy.structureTitle}</h2>
        <p>{copy.structureIntro}</p>
        <div className="landing-structure-note"><ShieldCheck size={17} />{copy.structureNote}</div>
      </div>
      <div className="landing-structure-map" aria-label={copy.structureTitle}>
        <div className="structure-level structure-platform"><span><Network size={17} /></span><strong>{copy.structurePlatform}</strong></div>
        <div className="structure-connector" />
        <div className="structure-level structure-tenant"><span><Building2 size={17} /></span><strong>{copy.structureTenant}</strong></div>
        <div className="structure-branches">
          <div className="structure-branch">
            <div className="structure-connector" />
            <div className="structure-level"><span><Building size={16} /></span><strong>{copy.structureClinic}</strong></div>
            <div className="structure-connector" />
            <div className="structure-level structure-leaf"><span><Building size={14} /></span><strong>{copy.structureBranch} 01</strong></div>
            <div className="structure-level structure-leaf"><span><Building size={14} /></span><strong>{copy.structureBranch} 02</strong></div>
          </div>
          <div className="structure-branch">
            <div className="structure-connector" />
            <div className="structure-level"><span><Building size={16} /></span><strong>{copy.structureClinic} 02</strong></div>
            <div className="structure-connector" />
            <div className="structure-level structure-leaf"><span><Building size={14} /></span><strong>{copy.structureBranch} 01</strong></div>
          </div>
        </div>
      </div>
    </section>
  )
}
