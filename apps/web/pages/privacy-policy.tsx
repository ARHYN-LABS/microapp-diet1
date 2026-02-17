export default function PrivacyPolicyPage() {
  return (
    <main className="container page-shell legal-page">
      <h1>Privacy Policy</h1>
      <p className="text-muted">Effective date: February 17, 2026</p>

      <section className="glass-card legal-section">
        <h2>What We Collect</h2>
        <ul>
          <li>Account details like name and email.</li>
          <li>Food scan images and extracted nutrition/ingredient results.</li>
          <li>Profile preferences and allergy/restriction settings.</li>
          <li>Basic technical logs for reliability and security.</li>
        </ul>
      </section>

      <section className="glass-card legal-section">
        <h2>How We Use Data</h2>
        <ul>
          <li>Provide scan analysis, scoring, and personalization.</li>
          <li>Keep history across devices for signed-in users.</li>
          <li>Process billing and subscriptions through Stripe.</li>
          <li>Improve app quality, prevent abuse, and resolve incidents.</li>
        </ul>
      </section>

      <section className="glass-card legal-section">
        <h2>Sharing</h2>
        <p>
          We share data only with service providers needed to operate the app
          (for example hosting, authentication, and payments). We do not sell
          personal data.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>Retention and Deletion</h2>
        <p>
          Data is retained while your account is active or as required for
          legal/security obligations. You can request account deletion by
          contacting support.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>Contact</h2>
        <p>
          For privacy requests, contact: <strong>support@safe-plate.ai</strong>
        </p>
      </section>
    </main>
  )
}
