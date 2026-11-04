type LandingSectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  id?: string
}

export function LandingSectionHeading({ eyebrow, title, description, id }: LandingSectionHeadingProps) {
  return (
    <div className="landing-section-heading">
      <div className="landing-eyebrow"><span className="landing-eyebrow-dot" />{eyebrow}</div>
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
