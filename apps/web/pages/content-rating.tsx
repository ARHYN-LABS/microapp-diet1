export default function ContentRatingPage() {
  return (
    <main className="container page-shell legal-page">
      <h1>Content Rating Information</h1>
      <p className="text-muted">Prepared for app store review</p>

      <section className="glass-card legal-section">
        <h2>App Category</h2>
        <p>
          SafePlate AI is an educational and utility app for food label/image
          interpretation, nutrition awareness, and dietary compatibility checks.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>Audience</h2>
        <p>General audience. No adult-only content is provided by design.</p>
      </section>

      <section className="glass-card legal-section">
        <h2>Content and Interactions</h2>
        <ul>
          <li>No gambling content.</li>
          <li>No sexual content or nudity.</li>
          <li>No graphic violence content.</li>
          <li>No user-generated public feed or open social chat.</li>
          <li>Health/nutrition guidance is informational, not medical advice.</li>
        </ul>
      </section>

      <section className="glass-card legal-section">
        <h2>Monetization</h2>
        <p>
          Subscription-based plans may be offered via Stripe billing. See the
          pricing page and ads disclosure page for details.
        </p>
      </section>
    </main>
  )
}
