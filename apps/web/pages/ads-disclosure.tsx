export default function AdsDisclosurePage() {
  return (
    <main className="container page-shell legal-page">
      <h1>Ads Disclosure</h1>
      <p className="text-muted">Last updated: February 17, 2026</p>

      <section className="glass-card legal-section">
        <h2>Current Status</h2>
        <p>
          SafePlate AI currently does not serve third-party display or
          personalized ads inside the mobile app or web app.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>If Ads Are Added Later</h2>
        <p>
          This page will be updated before ads go live. Any ad-enabled release
          will include updated disclosure and data safety details in app stores.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>Billing Promotions</h2>
        <p>
          Plan pricing and upgrade prompts are product/billing UI, not ad
          placements.
        </p>
      </section>
    </main>
  )
}
