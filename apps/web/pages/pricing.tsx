import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getBillingSummary } from "@wimf/shared"
import { getToken } from "../lib/auth"
import { apiBase } from "../lib/apiBase"

const plans = [
  { key: "free", label: "Free", price: "$0", scans: 10 },
  { key: "silver", label: "Silver", price: "$9.99", scans: 150 },
  { key: "golden", label: "Golden", price: "$19.99", scans: 300 }
]

export default function Pricing() {
  const router = useRouter()
  const paymentsEnabled = false
  const [planName, setPlanName] = useState("free")
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      const token = getToken()
      if (!token) {
        setError("Please log in to view plans.")
        setLoading(false)
        return
      }
      try {
        const summary = await getBillingSummary({ baseUrl: apiBase, token })
        setPlanName(summary.planName || "free")
        setPlanExpiresAt(summary.planExpiresAt || null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpgrade = async () => {
    if (!paymentsEnabled) {
      setError("Checkout is disabled in test mode.")
      return
    }
    router.push("/settings")
  }

  return (
    <main className="container page-shell">
      <section className="hero">
        <div>
          <h1>Pricing</h1>
          <p>Upgrade anytime to increase your monthly scan limit.</p>
          {planExpiresAt ? (
            <p style={{ color: "#6b7a90" }}>
              Current plan expires on {new Date(planExpiresAt).toLocaleDateString()}.
            </p>
          ) : null}
          {loading ? <p>Loading billing...</p> : null}
          {error ? <p style={{ color: "#cc3b3b" }}>{error}</p> : null}
        </div>
      </section>

      <section className="grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {plans.map((plan) => {
          const isCurrent = plan.key === planName
          return (
            <div
              key={plan.key}
              style={{
                border: "1px solid #e6edf5",
                borderRadius: 20,
                padding: 24,
                background: "#ffffff"
              }}
            >
              <h3 style={{ marginBottom: 6 }}>{plan.label}</h3>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{plan.price} / month</p>
              <p style={{ color: "#6b7a90" }}>{plan.scans} scans</p>
              <button
                onClick={() => (isCurrent ? null : handleUpgrade())}
                disabled={isCurrent || !paymentsEnabled}
                style={{
                  marginTop: 16,
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: isCurrent || !paymentsEnabled ? "#e6edf5" : "#16213e",
                  color: isCurrent ? "#6b7a90" : "#8a97ab",
                  cursor: "default"
                }}
              >
                {isCurrent ? "Current Plan" : "Upgrade (Soon)"}
              </button>
            </div>
          )
        })}
      </section>

      <p style={{ marginTop: 16, color: "#6b7a90", textAlign: "center" }}>
        Checkout is disabled in test mode. Plans are display-only.
      </p>
    </main>
  )
}
