import { useState } from "react"
import { useRouter } from "next/router"
import { logIn } from "@wimf/shared"
import { setProfile, setToken } from "../lib/auth"
import { apiBase } from "../lib/apiBase"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async () => {
    setStatus("Signing in...")
    try {
      const response = await logIn({ baseUrl: apiBase }, { email, password })
      setToken(response.token)
      setProfile({
        id: response.profile.id,
        fullName: response.profile.fullName,
        email: response.profile.email,
        avatarUrl: response.profile.avatarUrl
      })
      router.push("/")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  return (
    <main className="container page-shell">
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="glass-card">
            <h1 className="mb-3">Log in</h1>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <label className="form-check d-flex align-items-center gap-2 mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span className="text-muted">Remember me</span>
              </label>
              <a className="auth-link" href="/forgot-password">
                Forgot Password?
              </a>
            </div>
            <button className="btn btn-primary w-100" onClick={handleSubmit}>
              Log in
            </button>
            <a className="auth-social auth-google mt-3" href={`${apiBase}/auth/google/start`}>
              <span className="auth-social-icon">G</span>
              <span>Continue with Google</span>
            </a>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <div className="text-center text-muted">
              Don&apos;t have an account?{" "}
              <a className="auth-link" href="/signup">
                Register
              </a>
            </div>
            {status && <div className="text-muted mt-2">{status}</div>}
          </div>
        </div>
      </div>
    </main>
  )
}
