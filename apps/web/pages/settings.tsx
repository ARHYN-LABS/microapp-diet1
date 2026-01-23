import { useEffect, useState } from "react"
import { getPrefs, savePrefs } from "@wimf/shared"
import type { UserPrefs } from "@wimf/shared"

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
const demoUser = process.env.NEXT_PUBLIC_DEMO_USER_ID || "demo-user-1"

const emptyPrefs: UserPrefs = {
  userId: demoUser,
  halalCheckEnabled: false,
  lowSodiumMgLimit: null,
  lowSugarGlimit: null,
  lowCarbGlimit: null,
  lowCalorieLimit: null,
  highProteinGtarget: null,
  vegetarian: false,
  vegan: false,
  sensitiveStomach: false
}

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export default function Settings() {
  const [prefs, setPrefs] = useState<UserPrefs>(emptyPrefs)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const remote = await getPrefs({ baseUrl: apiBase }, demoUser)
        setPrefs({ ...emptyPrefs, ...remote })
      } catch {
        setPrefs(emptyPrefs)
      }
    }

    load()
  }, [])

  const handleSave = async () => {
    setStatus("Saving...")
    try {
      const saved = await savePrefs({ baseUrl: apiBase }, prefs)
      setPrefs(saved)
      setStatus("Saved")
    } catch {
      setStatus("Unable to save preferences")
    }
  }

  return (
    <main className="container page-shell">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Preferences</h1>
          <div className="text-muted">Personalize flags for your scans.</div>
        </div>
        <span className="chip">Profile</span>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="glass-card">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={prefs.halalCheckEnabled}
                onChange={(event) =>
                  setPrefs((prev) => ({ ...prev, halalCheckEnabled: event.target.checked }))
                }
              />
              <label className="form-check-label">Enable halal check</label>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Low sodium limit (mg)</label>
                <input
                  className="form-control"
                  value={prefs.lowSodiumMgLimit ?? ""}
                  onChange={(event) =>
                    setPrefs((prev) => ({
                      ...prev,
                      lowSodiumMgLimit: toNumberOrNull(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Low sugar limit (g)</label>
                <input
                  className="form-control"
                  value={prefs.lowSugarGlimit ?? ""}
                  onChange={(event) =>
                    setPrefs((prev) => ({
                      ...prev,
                      lowSugarGlimit: toNumberOrNull(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Low carb limit (g)</label>
                <input
                  className="form-control"
                  value={prefs.lowCarbGlimit ?? ""}
                  onChange={(event) =>
                    setPrefs((prev) => ({
                      ...prev,
                      lowCarbGlimit: toNumberOrNull(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Low calorie limit (per 50g)</label>
                <input
                  className="form-control"
                  value={prefs.lowCalorieLimit ?? ""}
                  onChange={(event) =>
                    setPrefs((prev) => ({
                      ...prev,
                      lowCalorieLimit: toNumberOrNull(event.target.value)
                    }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">High protein target (g)</label>
                <input
                  className="form-control"
                  value={prefs.highProteinGtarget ?? ""}
                  onChange={(event) =>
                    setPrefs((prev) => ({
                      ...prev,
                      highProteinGtarget: toNumberOrNull(event.target.value)
                    }))
                  }
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.vegetarian}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, vegetarian: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Vegetarian</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.vegan}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, vegan: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Vegan</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.sensitiveStomach}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, sensitiveStomach: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Sensitive stomach</label>
                </div>
              </div>
            </div>

            <button className="btn btn-primary mt-4" onClick={handleSave}>
              Save preferences
            </button>
            {status && <div className="text-muted mt-2">{status}</div>}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="metric-card">
            <div className="text-muted small">Disclaimer</div>
            <div className="fw-semibold">Educational, not medical advice.</div>
            <div className="text-muted small mt-2">
              Preferences adjust flags only. They never change the base score.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
