export default function AccountDeletionPage() {
  return (
    <main className="container page-shell legal-page">
      <h1>Account Deletion</h1>
      <p className="text-muted">Last updated: February 18, 2026</p>

      <section className="glass-card legal-section">
        <h2>How to Request Deletion</h2>
        <ol>
          <li>
            Send an email to <strong>support@safe-plate.ai</strong> from the
            account email you want removed.
          </li>
          <li>
            Use subject line: <strong>Account Deletion Request</strong>.
          </li>
          <li>
            Include your account email and full name so we can verify the
            request.
          </li>
        </ol>
      </section>

      <section className="glass-card legal-section">
        <h2>What Gets Deleted</h2>
        <ul>
          <li>Account profile information.</li>
          <li>Food scan history and uploaded scan images.</li>
          <li>Preferences, alerts, and saved personalization settings.</li>
        </ul>
      </section>

      <section className="glass-card legal-section">
        <h2>Processing Time</h2>
        <p>
          We process verified deletion requests within 30 days. Some records
          may be retained for legal, fraud-prevention, billing, or security
          obligations where required by law.
        </p>
      </section>

      <section className="glass-card legal-section">
        <h2>Need Help?</h2>
        <p>
          Contact <strong>support@safe-plate.ai</strong> if you cannot access
          your account and need deletion assistance.
        </p>
      </section>
    </main>
  )
}
