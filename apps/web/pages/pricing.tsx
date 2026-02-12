import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getBillingSummary } from "@wimf/shared"
import { getToken } from "../lib/auth"
import { apiBase } from "../lib/apiBase"

type PlanDef = {
  key: string
  label: string
  monthlyPrice: number
  scans: number
}

const plans: PlanDef[] = [
  { key: "free", label: "Free", monthlyPrice: 0, scans: 10 },
  { key: "silver", label: "Silver", monthlyPrice: 2.99, scans: 150 },
  { key: "golden", label: "Golden", monthlyPrice: 6.99, scans: 300 }
]

const formatPrice = (value: number) =>
  `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`

export default function Pricing() {
  const router = useRouter()
  const paymentsEnabled = false
  const [isAnnual, setIsAnnual] = useState(false)
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

  const handleUpgrade = () => {
    if (!paymentsEnabled) {
      setError("Checkout is disabled in test mode.")
      return
    }
    router.push("/settings")
  }

  return (
    <main className="container page-shell pricing-shell">
      <section className="pricing-hero">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that fits your scan needs. Upgrade or downgrade anytime.</p>

        <div className="pricing-toggle">
          <span className={!isAnnual ? "active" : ""}>Monthly</span>
          <button
            type="button"
            className={`toggle-switch ${isAnnual ? "annual" : ""}`}
            onClick={() => setIsAnnual((v) => !v)}
            aria-label="Toggle annual billing"
          >
            <span />
          </button>
          <span className={isAnnual ? "active" : ""}>Annual</span>
          <span className="save-chip">Save 20%</span>
        </div>

        {planExpiresAt ? (
          <p className="pricing-expiry">
            Current plan expires on {new Date(planExpiresAt).toLocaleDateString()}.
          </p>
        ) : null}
        {loading ? <p className="pricing-info">Loading billing...</p> : null}
        {error ? <p className="pricing-error">{error}</p> : null}
      </section>

      <section className="pricing-table-wrap">
        <table className="pricing-table">
          <thead>
            <tr>
              <th />
              {plans.map((plan) => (
                <th key={plan.key} className={plan.key === planName ? "current-col" : ""}>
                  {plan.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="row-head">Price</td>
              {plans.map((plan) => {
                const isCurrent = plan.key === planName
                const amount = isAnnual ? plan.monthlyPrice * 12 * 0.8 : plan.monthlyPrice
                return (
                  <td key={plan.key} className={isCurrent ? "current-col" : ""}>
                    <div className="price-cell">
                      <strong>{formatPrice(amount)}</strong>
                      <span>{isAnnual ? "/year" : "/month"}</span>
                    </div>
                    <button
                      onClick={() => (isCurrent ? null : handleUpgrade())}
                      disabled={isCurrent || !paymentsEnabled}
                      className={`plan-btn ${isCurrent ? "is-current" : ""}`}
                    >
                      {isCurrent ? "Current Plan" : "Upgrade (Soon)"}
                    </button>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td className="row-head">Monthly scan limit</td>
              {plans.map((plan) => (
                <td key={plan.key} className={plan.key === planName ? "current-col" : ""}>
                  {plan.scans} scans
                </td>
              ))}
            </tr>

            <tr>
              <td className="row-head">History sync across devices</td>
              {plans.map((plan) => (
                <td key={plan.key} className={plan.key === planName ? "current-col check" : "check"}>
                  ✓
                </td>
              ))}
            </tr>

            <tr>
              <td className="row-head">Profile + image storage</td>
              {plans.map((plan) => (
                <td key={plan.key} className={plan.key === planName ? "current-col check" : "check"}>
                  ✓
                </td>
              ))}
            </tr>

            <tr>
              <td className="row-head">Priority support</td>
              <td>-</td>
              <td className="check">✓</td>
              <td className={planName === "golden" ? "current-col check" : "check"}>✓</td>
            </tr>
          </tbody>
        </table>
      </section>

      {!paymentsEnabled ? (
        <p className="pricing-note">Checkout is disabled in test mode. Plans are display-only.</p>
      ) : null}
    </main>
  )
}
