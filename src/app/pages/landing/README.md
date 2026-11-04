# Public landing page

The public landing page is intentionally isolated from the clinic and platform portals.

## Structure

- `landing-content.ts`: bilingual copy and the shared `LandingCopy` type.
- `landing-page.css`: landing-only visual system, responsive rules, motion and hover states.
- `sections/`: one component per page section.
  - `landing-hero-section.tsx`: hero and illustrative workspace preview.
  - `landing-features-section.tsx`: core product capabilities.
  - `landing-journey-section.tsx`: operational workflow narrative.
  - `landing-security-section.tsx`: platform access boundaries.
  - `landing-structure-section.tsx`: platform → tenant → clinic → branch hierarchy.
  - `landing-faq-section.tsx`: accessible native disclosure FAQ.
  - `landing-contact-section.tsx`: inquiry form and email handoff.
  - `landing-footer-section.tsx`: closing CTA and footer.
  - `landing-section-heading.tsx`: shared section heading.

## Contact form

The form does not post visitor data to an API. When `VITE_CONTACT_EMAIL` is configured, it opens the visitor's email application with a prefilled message. Otherwise it displays a clear configuration notice.

Add the recipient to the local frontend environment:

```env
VITE_CONTACT_EMAIL=your-real-contact-address@example.com
```

Do not commit real credentials or private contact settings to the repository.

## Boundaries

- Keep only the two portal login links in the main navigation.
- Keep landing-specific styles in `landing-page.css`; do not grow the global stylesheet with landing rules.
- Keep all public-facing copy in `landing-content.ts` so Arabic and English remain in sync.
- Treat dashboard numbers and charts as illustrative preview artwork, never as live clinic data.
