import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createBillingCheckout, getBillingSummary } from "@wimf/shared"
import { getToken } from "../lib/auth"
import { apiBase } from "../lib/apiBase"

const plans = [
  { key: "free", label: "Free", price: "$0", scans: 10 },
  { key: "silver", label: "Silver", price: "$9.99", scans: 150 },
  { key: "golden", label: "Golden", price: "$19.99", scans: 300 }
]

export default function Pricing() {
  const router = useRouter()
  const [planName, setPlanName] = useState("free")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState("")

  useEffect(() => {
    const load = async () => {
      const token = getToken()
      if (!token) {
        setError("Please log in to manage billing.")
        setLoading(false)
        return
      }
      try {
        const summary = await getBillingSummary({ baseUrl: apiBase, token })
        setPlanName(summary.planName || "free")
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpgrade = async (planKey: string) => {
    const token = getToken()
    if (!token) {
      router.push("/login")
      return
    }
    setBusy(planKey)
    setError("")
    try {
      const session = await createBillingCheckout({ baseUrl: apiBase, token }, { planName: planKey })
      if (session?.url) {
        window.location.href = session.url
      } else {
        throw new Error("Checkout URL missing")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy("")
    }
  }

  return (
    <main className="container page-shell">
      <section className="hero">
        <div>
          <h1>Pricing</h1>
          <p>Upgrade anytime to increase your monthly scan limit.</p>
          {loading ? <p>Loading billing…</p> : null}
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
                onClick={() => (isCurrent ? null : handleUpgrade(plan.key))}
                disabled={isCurrent || !!busy}
                style={{
                  marginTop: 16,
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: isCurrent ? "#e6edf5" : "#16213e",
                  color: isCurrent ? "#6b7a90" : "#ffffff",
                  cursor: isCurrent ? "default" : "pointer"
                }}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          )
        })}
      </section>
    </main>
  )
}
