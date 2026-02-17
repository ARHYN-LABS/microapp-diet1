export default function DataSafetyPage() {
  return (
    <main className="container page-shell legal-page">
      <h1>Data Safety</h1>
      <p className="text-muted">Last updated: February 17, 2026</p>

      <section className="glass-card legal-section">
        <h2>Data Types</h2>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Collected</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Email / account profile</td>
                <td>Yes</td>
                <td>Authentication and account management</td>
              </tr>
              <tr>
                <td>Food scan images</td>
                <td>Yes</td>
                <td>Image analysis and scan history</td>
              </tr>
              <tr>
                <td>Health/diet preferences</td>
                <td>Yes</td>
                <td>Personalized alerts and scoring</td>
              </tr>
              <tr>
                <td>Payment metadata</td>
                <td>Yes</td>
                <td>Subscription lifecycle and billing status</td>
              </tr>
              <tr>
                <td>Precise location</td>
                <td>No</td>
                <td>Not collected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card legal-section">
        <h2>Security</h2>
        <ul>
          <li>Transport encryption for API traffic (HTTPS).</li>
          <li>Access control via authenticated tokens.</li>
          <li>Payment processing handled by Stripe.</li>
        </ul>
      </section>

      <section className="glass-card legal-section">
        <h2>User Controls</h2>
        <ul>
          <li>Update profile and preference data in app settings.</li>
          <li>Request account deletion through support.</li>
        </ul>
      </section>
    </main>
  )
}
