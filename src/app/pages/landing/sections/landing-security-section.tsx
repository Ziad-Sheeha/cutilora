import { CircleCheck, Command, HeartPulse, LayoutDashboard, ShieldCheck, Workflow } from "lucide-react"
import type { LandingCopy } from "../landing-content"

export function LandingSecuritySection({ copy }: { copy: LandingCopy }) {
  return (
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
  )
}
