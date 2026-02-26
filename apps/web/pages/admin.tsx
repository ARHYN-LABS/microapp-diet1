import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminResetPassword,
  adminGetAnalytics
} from "@wimf/shared"
import type { AdminUser, AdminAnalytics, Role } from "@wimf/shared"
import { getToken, getProfile } from "../lib/auth"
import { apiBase } from "../lib/apiBase"

const LIMIT = 20

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [planFilter, setPlanFilter] = useState("")
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("")

  // Create / Edit modal
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState<Role>("USER")
  const [formPlan, setFormPlan] = useState("free")
  const [saving, setSaving] = useState(false)

  // Reset password modal
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetNewPassword, setResetNewPassword] = useState("")

  const getConfig = () => ({ baseUrl: apiBase, token: getToken() || undefined })

  // Auth + role guard
  useEffect(() => {
    const token = getToken()
    const profile = getProfile()
    if (!token) { router.replace("/login"); return }
    if (profile?.role !== "SUPER_ADMIN") { router.replace("/"); return }
    setLoading(false)
  }, [router])

  const loadData = useCallback(async () => {
    try {
      const config = getConfig()
      const [usersRes, analyticsRes] = await Promise.all([
        adminGetUsers(config, { search, role: roleFilter, plan: planFilter, page, limit: LIMIT }),
        adminGetAnalytics(config)
      ])
      setUsers(usersRes.users)
      setTotal(usersRes.total)
      setAnalytics(analyticsRes)
      setStatus("")
    } catch (err) {
      setStatus((err as Error).message)
    }
  }, [search, roleFilter, planFilter, page])

  useEffect(() => {
    if (!loading) loadData()
  }, [loading, loadData])

  const openCreateModal = () => {
    setEditingUser(null)
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("USER")
    setFormPlan("free")
    setShowModal(true)
  }

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user)
    setFormName(user.fullName || "")
    setFormEmail(user.email)
    setFormPassword("")
    setFormRole(user.role)
    setFormPlan(user.planName)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const config = getConfig()
      if (editingUser) {
        await adminUpdateUser(config, editingUser.id, {
          fullName: formName,
          email: formEmail,
          role: formRole,
          planName: formPlan
        })
      } else {
        await adminCreateUser(config, {
          fullName: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          planName: formPlan
        })
      }
      setShowModal(false)
      await loadData()
    } catch (err) {
      setStatus((err as Error).message)
    }
    setSaving(false)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return
    try {
      await adminDeleteUser(getConfig(), userId)
      await loadData()
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const handleResetPassword = async () => {
    if (!resetUserId) return
    try {
      await adminResetPassword(getConfig(), resetUserId, { newPassword: resetNewPassword })
      setResetUserId(null)
      setResetNewPassword("")
      setStatus("Password reset successfully")
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

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
        <title>Admin Dashboard | SafePlate AI</title>
      </Head>

      <main className="container page-shell">
        <h1 className="mb-4">Admin Dashboard</h1>

        {/* Analytics Cards */}
        {analytics && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-number">{analytics.totalUsers}</div>
                <div className="metric-sub">Total Registered Users</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-number">{analytics.activeUsersLast30Days}</div>
                <div className="metric-sub">Active Users (30 days)</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {analytics.planDistribution.map((p) => (
                    <div key={p.plan} className="d-flex justify-content-between align-items-center">
                      <span className="chip">{p.plan}</span>
                      <strong>{p.count}</strong>
                    </div>
                  ))}
                </div>
                <div className="metric-sub mt-2">Plan Distribution</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters + Create Button */}
        <div className="glass-card mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              >
                <option value="">All roles</option>
                <option value="USER">USER</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Plan</label>
              <select
                className="form-select"
                value={planFilter}
                onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
              >
                <option value="">All plans</option>
                <option value="free">Free</option>
                <option value="silver">Silver</option>
                <option value="golden">Golden</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={openCreateModal}>
                + New User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Scans</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName || "---"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`chip${user.role === "SUPER_ADMIN" ? " chip-danger" : ""}`}>
                        {user.role}
                      </span>
                    </td>
                    <td><span className="chip">{user.planName}</span></td>
                    <td>{user.scansUsed}/{user.scanLimit}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openEditModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => { setResetUserId(user.id); setResetNewPassword("") }}
                        >
                          Reset PW
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-muted text-center py-4">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span className="align-self-center text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {status && <div className="text-muted mt-3">{status}</div>}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content" style={{ borderRadius: "24px" }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? "Edit User" : "Create User"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control"
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                      />
                      <div className="text-muted small mt-1">At least 8 characters.</div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as Role)}
                    >
                      <option value="USER">USER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Plan</label>
                    <select
                      className="form-select"
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value)}
                    >
                      <option value="free">Free</option>
                      <option value="silver">Silver</option>
                      <option value="golden">Golden</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetUserId && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content" style={{ borderRadius: "24px" }}>
                <div className="modal-header">
                  <h5 className="modal-title">Reset Password</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setResetUserId(null)}
                  />
                </div>
                <div className="modal-body">
                  <p className="text-muted">
                    Set a new password for{" "}
                    <strong>{users.find((u) => u.id === resetUserId)?.email}</strong>
                  </p>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                    />
                    <div className="text-muted small mt-1">At least 8 characters.</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setResetUserId(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleResetPassword}>
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
