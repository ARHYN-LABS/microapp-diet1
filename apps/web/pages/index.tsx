export default function Home() {
  return (
    <main className="container page-shell">
      <section className="hero fade-in">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="hero-kicker mb-3">What&apos;s In My Food?</div>
            <h1 className="display-4 fw-bold">
              Know what&apos;s in your food&#8212;in seconds.
            </h1>
            <p className="lead text-muted">
              Upload labels and get ingredients explained, halal clarity, and a transparent
              quality score. Built for fast decisions, not guesswork.
            </p>
            <div className="hero-cta mt-4">
              <a className="btn btn-primary" href="/scan">
                Try the demo
              </a>
              <a className="btn btn-outline-light" href="/settings">
                Set preferences
              </a>
            </div>
            <div className="footer-note mt-4">
              Educational, not medical advice.
            </div>
          </div>
          <div className="col-lg-5">
            <div className="glass-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="text-muted small">Calories / 100g</div>
                  <div className="metric-number">120</div>
                </div>
                <span className="chip">Scan-ready</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Quality score</div>
                  <div className="metric-number">78</div>
                </div>
                <span className="chip">Good</span>
              </div>
              <div className="mt-3 text-muted small">
                Rings and flags highlight sodium, sugar, and protein in one glance.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-3 mt-4 fade-in">
        <div className="col-md-4">
          <div className="metric-card h-100">
            <div className="text-muted small">Scans this week</div>
            <div className="metric-number">1,248</div>
            <div className="metric-sub">Placeholder usage count</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card h-100">
            <div className="text-muted small">Avg. label confidence</div>
            <div className="metric-number">0.82</div>
            <div className="metric-sub">OCR + parsing signal</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card h-100">
            <div className="text-muted small">Ingredients explained</div>
            <div className="metric-number">60+</div>
            <div className="metric-sub">Growing knowledge base</div>
          </div>
        </div>
      </section>

      <section className="row g-3 mt-4 fade-in">
        {[
          {
            title: "Fast scan flow",
            body: "Capture ingredients + nutrition. Optional front for product name."
          },
          {
            title: "Transparent scoring",
            body: "Explainable score with the top factors moving it up or down."
          },
          {
            title: "Personalized flags",
            body: "Halal, low sodium, low sugar, vegan, and more."
          },
          {
            title: "No product database",
            body: "Everything comes from your label images, never guesses."
          }
        ].map((item) => (
          <div className="col-md-6 col-lg-3" key={item.title}>
            <div className="glass-card h-100">
              <h3 className="h6">{item.title}</h3>
              <p className="text-muted mb-0">{item.body}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-5 footer-note">
        Always verify nutrition labels and ingredients with the manufacturer. Terms and
        privacy placeholders.
      </footer>
    </main>
  )
}
