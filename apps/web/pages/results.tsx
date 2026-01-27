import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { getPrefs } from "@wimf/shared"
import type { AnalyzeFromImagesResponse, UserPrefs } from "@wimf/shared"
import { getProfile, getToken } from "../lib/auth"
import { getHealthPrefs } from "../lib/healthPrefs"
import { getLastScanImage } from "../lib/scanImages"

export default function Results() {
  const [analysis, setAnalysis] = useState<AnalyzeFromImagesResponse | null>(null)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [healthPrefs, setHealthPrefs] = useState({ restrictions: [], allergens: [] as string[] })
  const [activeFlag, setActiveFlag] =
    useState<AnalyzeFromImagesResponse["personalizedFlags"][number] | null>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
  const profile = typeof window !== "undefined" ? getProfile() : null
  const formatTag = (value: string) =>
    value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

  useEffect(() => {
    const stored = sessionStorage.getItem("wimf.analysis")
    if (stored) {
      setAnalysis(JSON.parse(stored) as AnalyzeFromImagesResponse)
    }
    const storedPreview = sessionStorage.getItem("wimf.preview") || getLastScanImage()
    if (storedPreview) setPreview(storedPreview)
    setHealthPrefs(getHealthPrefs())
  }, [])

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        if (!profile) return
        const remote = await getPrefs({ baseUrl: apiBase, token: getToken() || undefined }, profile.id)
        setPrefs(remote)
      } catch {
        setPrefs(null)
      }
    }

    if (profile) {
      loadPrefs()
    }
  }, [apiBase, profile])

  const caloriesPer100g = useMemo(() => {
    if (!analysis) return null
    const nutrition = analysis.nutritionHighlights
    if (!nutrition) return null
    if (nutrition.caloriesPer100g !== null && nutrition.caloriesPer100g !== undefined) {
      return Number(nutrition.caloriesPer100g.toFixed(1))
    }
    if (
      nutrition.calories !== null &&
      nutrition.calories !== undefined &&
      nutrition.servingSizeG !== null &&
      nutrition.servingSizeG !== undefined &&
      nutrition.servingSizeG > 0
    ) {
      return Number(((nutrition.calories * 100) / nutrition.servingSizeG).toFixed(1))
    }
    return null
  }, [analysis])
  const labelConfidence = useMemo(() => {
    if (!analysis) return "0.00"
    const values = Object.values(analysis.parsing.confidences)
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return average.toFixed(2)
  }, [analysis])

  const ringCards = useMemo(() => {
    if (!analysis) return []
    const nutrition = analysis.nutritionHighlights
    const sodium = nutrition?.sodium_mg ?? null
    const sugar = nutrition?.sugar_g ?? null
    const protein = nutrition?.protein_g ?? null

    return [
      {
        title: "Sodium vs limit",
        value: sodium,
        unit: "mg",
        limit: prefs?.lowSodiumMgLimit ?? null,
        color: "var(--accent)"
      },
      {
        title: "Sugar vs limit",
        value: sugar,
        unit: "g",
        limit: prefs?.lowSugarGlimit ?? null,
        color: "var(--warning)"
      },
      {
        title: "Protein vs target",
        value: protein,
        unit: "g",
        limit: prefs?.highProteinGtarget ?? null,
        color: "var(--accent-2)"
      }
    ]
  }, [analysis, prefs])

  if (!analysis) {
    return (
      <main className="container page-shell">
        <h1 className="mb-4">Results</h1>
        <p className="text-muted">No analysis found. Please run a scan first.</p>
      </main>
    )
  }

  return (
    <main className="container page-shell">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">{analysis.productName || "Unknown product"}</h1>
          <div className="text-muted">Label read confidence: {labelConfidence}</div>
        </div>
        <span className="chip">Results</span>
      </div>

      {preview && (
        <div className="glass-card mb-3">
          <div className="fw-semibold mb-2">Captured image</div>
          <img src={preview} alt="Captured preview" className="img-fluid rounded" />
        </div>
      )}

      <section className="glass-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h5 mb-0">Dietary focus</h2>
          <span className="text-muted small">Preferences</span>
        </div>
        <div className="mb-3">
          <div className="text-muted small mb-2">Dietary restrictions</div>
          <div className="d-flex flex-wrap gap-2">
            {healthPrefs.restrictions.length === 0 && (
              <span className="text-muted small">None selected</span>
            )}
            {healthPrefs.restrictions.map((item) => (
              <span key={item} className="chip">{formatTag(item)}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-muted small mb-2">Allergens</div>
          <div className="d-flex flex-wrap gap-2">
            {healthPrefs.allergens.length === 0 && (
              <span className="text-muted small">None selected</span>
            )}
            {healthPrefs.allergens.map((item) => (
              <span key={item} className="chip">{formatTag(item)}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="metric-card h-100">
            <div className="text-muted small">Quality score</div>
            <div className="metric-number">{analysis.score.value}</div>
            <div className="d-flex align-items-center gap-2">
              <span className="chip">{analysis.score.category}</span>
              <span className="text-muted small">AI model v1</span>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="metric-card h-100">
            <div className="text-muted small">Approx calories per 100g</div>
            <div className="metric-number">
              {caloriesPer100g === null ? "Unknown" : caloriesPer100g}
            </div>
            <div className="metric-sub">
              {caloriesPer100g === null ? "Estimate unavailable" : "Approximate estimate"}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-4">
        <div className="glass-card">
          <div className="text-muted small">Suitability</div>
          <div className="fw-semibold">
            {analysis.suitability?.verdict === "good"
              ? "Suitable"
              : analysis.suitability?.verdict === "not_recommended"
                ? "Not recommended"
                : "Unknown"}
          </div>
          <div className="text-muted small mt-2">
            {analysis.suitability?.reasons?.length
              ? analysis.suitability.reasons.join(" ")
              : "No additional notes."}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h5 mb-0">Personalized for you</h2>
          <span className="text-muted small">Tap a flag for details</span>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {analysis.personalizedFlags.map((flag) => (
            <button
              key={flag.flag}
              className={`flag-chip ${
                flag.status === "pass"
                  ? "flag-pass"
                  : flag.status === "warn"
                    ? "flag-warn"
                    : flag.status === "fail"
                      ? "flag-fail"
                      : "flag-unknown"
              }`}
              type="button"
              onClick={() => setActiveFlag(flag)}
            >
              {flag.flag}: {flag.status}
            </button>
          ))}
        </div>
      </section>

      <section className="row g-3 mt-3">
        {ringCards.map((ring) => {
          const hasData = ring.limit !== null && ring.value !== null && ring.value !== undefined
          const progress =
            hasData && ring.limit
              ? Math.min(100, ((ring.value ?? 0) / ring.limit) * 100)
              : 0
          const ringStyle = {
            "--progress": progress,
            "--ring-color": ring.color
          } as CSSProperties

          return (
            <div className="col-md-4" key={ring.title}>
              <div className="metric-card h-100 text-center">
                <div
                  className="progress-ring"
                  style={ringStyle}
                >
                  <div>
                    <div className="ring-value">{hasData ? Math.round(progress) : "--"}%</div>
                    <div className="ring-label">{ring.title}</div>
                  </div>
                </div>
                <div className="text-muted small">
                  {hasData
                    ? `${ring.value}${ring.unit} of ${ring.limit}${ring.unit}`
                    : "Not detected"}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="mt-4">
        <div className="glass-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted small">Halal status</div>
              <div className="fw-semibold">{analysis.halal.status.toUpperCase()}</div>
            </div>
            <span className="chip">Confidence {analysis.halal.confidence.toFixed(2)}</span>
          </div>
          <p className="text-muted mb-0 mt-2">{analysis.halal.explanation}</p>
        </div>
      </section>

      <section className="row g-3 mt-3">
        <div className="col-lg-6">
          <details className="glass-card">
            <summary className="fw-semibold mb-2">Why this score?</summary>
            <ul className="list-unstyled mb-0">
              {analysis.score.explanations.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  {item.label}: {item.direction === "up" ? "+" : "-"}
                  {item.points} - {item.reason}
                </li>
              ))}
            </ul>
          </details>
        </div>
        <div className="col-lg-6">
          <details className="glass-card">
            <summary className="fw-semibold mb-2">What we detected</summary>
            <div className="text-muted small">
              Ingredients: {analysis.parsing.extractedText.ingredientsText || "Not detected"}
            </div>
            <div className="text-muted small mt-2">
              Nutrition: {analysis.parsing.extractedText.nutritionText || "Not detected"}
            </div>
            <div className="text-muted small mt-2">
              Front: {analysis.parsing.extractedText.frontText || "Not provided"}
            </div>
          </details>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="h5">Ingredients explained</h2>
        <div className="row g-3">
          {analysis.ingredientBreakdown.map((item, index) => (
            <div className="col-md-6" key={`${item.name}-${index}`}>
              <div className="glass-card h-100">
                <div className="fw-semibold">
                  {item.status === "good"
                    ? "[OK]"
                    : item.status === "caution"
                      ? "[WARN]"
                      : "[NEUTRAL]"}{" "}
                  {item.name}
                </div>
                <div className="text-muted small mt-2">{item.plainEnglish}</div>
                <div className="text-muted small">Why used: {item.whyUsed}</div>
                <div className="text-muted small">Who might care: {item.whoMightCare}</div>
                {item.uncertaintyNote && (
                  <div className="text-muted small">Uncertainty: {item.uncertaintyNote}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 glass-card">
        <h2 className="h6">Approximate calories</h2>
        <div className="text-muted small">
          Calories: {analysis.nutritionHighlights?.calories ?? "Unknown"}
        </div>
      </section>

      {activeFlag && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 50 }}
          onClick={() => setActiveFlag(null)}
        >
          <div
            className="position-absolute bottom-0 start-0 end-0 p-4"
            style={{ maxWidth: 720, margin: "0 auto" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="glass-card">
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-semibold">{activeFlag.flag}</div>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => setActiveFlag(null)}
                >
                  Close
                </button>
              </div>
              <div className="text-muted small mt-2">{activeFlag.explanation}</div>
              <div className="text-muted small mt-2">
                Status: {activeFlag.status} | Confidence {activeFlag.confidence.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="footer-note mt-4">{analysis.disclaimer}</div>
    </main>
  )
}
