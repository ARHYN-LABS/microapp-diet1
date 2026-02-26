import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { adminGetChartData } from "@wimf/shared"
import type { AdminChartData } from "@wimf/shared"
import { getToken } from "../../lib/auth"
import { apiBase } from "../../lib/apiBase"

const PIE_COLORS = ["#2c7be5", "#1abc9c", "#f97316", "#e63946"]

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminChartData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace("/login"); return }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.role !== "SUPER_ADMIN") { router.replace("/"); return }
    } catch {
      router.replace("/"); return
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (loading) return
    const config = { baseUrl: apiBase, token: getToken() || undefined }
    adminGetChartData(config)
      .then(setData)
      .catch((err) => setError((err as Error).message))
  }, [loading])

  if (loading) {
    return (
      <main className="container page-shell">
        <div className="text-muted">Loading...</div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>Analytics | Admin | SafePlate AI</title>
      </Head>

      <main className="container page-shell">
        {/* Tab Navigation */}
        <div className="admin-tabs mb-4">
          <Link href="/admin/users" className="admin-tab">Users</Link>
          <Link href="/admin/analytics" className="admin-tab active">Analytics</Link>
        </div>

        <h1 className="mb-4">Analytics</h1>

        {error && <div className="text-danger mb-3">{error}</div>}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="text-muted small">Total Users</div>
                  <div className="metric-number">{data.totalUsers}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="text-muted small">Active (30 days)</div>
                  <div className="metric-number">{data.activeUsersLast30Days}</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="text-muted small">Total Scans</div>
                  <div className="metric-number">{data.totalScans}</div>
                </div>
              </div>
            </div>

            {/* Signups Chart */}
            <div className="glass-card mb-4">
              <h3 className="h6 mb-3">User Signups (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.signupsPerDay}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2c7be5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2c7be5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => v.slice(5)}
                    fontSize={12}
                    stroke="#6b7280"
                  />
                  <YAxis allowDecimals={false} fontSize={12} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e8e5e0" }}
                    labelFormatter={(v) => `Date: ${v}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2c7be5"
                    strokeWidth={2}
                    fill="url(#signupGrad)"
                    name="Signups"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Scans Chart */}
            <div className="glass-card mb-4">
              <h3 className="h6 mb-3">Scan Activity (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.scansPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e5e0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => v.slice(5)}
                    fontSize={12}
                    stroke="#6b7280"
                  />
                  <YAxis allowDecimals={false} fontSize={12} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e8e5e0" }}
                    labelFormatter={(v) => `Date: ${v}`}
                  />
                  <Bar dataKey="count" fill="#1abc9c" radius={[4, 4, 0, 0]} name="Scans" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Plan Distribution */}
            <div className="glass-card mb-4">
              <h3 className="h6 mb-3">Plan Distribution</h3>
              <div className="row align-items-center">
                <div className="col-md-6">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.planDistribution}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        label={({ name, value }: any) => `${name}: ${value}`}
                      >
                        {data.planDistribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-md-6">
                  {data.planDistribution.map((p, i) => (
                    <div key={p.plan} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: 12, height: 12, borderRadius: 4,
                            background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block"
                          }}
                        />
                        <span className="fw-semibold" style={{ textTransform: "capitalize" }}>{p.plan}</span>
                      </div>
                      <span className="fw-bold">{p.count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {!data && !error && <div className="text-muted">Loading charts...</div>}
      </main>
    </>
  )
}
