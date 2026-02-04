import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { clearToken, getProfile, getToken } from "../lib/auth"

export default function NavBar() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    const profile = getProfile()
    setIsAuthed(!!token)
    setName(profile?.fullName || profile?.email || null)
  }, [router.asPath])

  const handleLogout = () => {
    clearToken()
    setIsAuthed(false)
    router.push("/login")
  }

  return (
    <nav className="app-nav">
      <div className="container app-nav-inner">
        <div className="app-brand">
          <Link className="app-logo" href="/">
            <img src="/logo.png" alt="SafePlate AI" />
            <span>SafePlate AI</span>
          </Link>
        </div>
        <div className="app-links d-none d-lg-flex">
          <Link className={router.pathname === "/" ? "active" : ""} href="/">
            Home
          </Link>
          <Link className={router.pathname === "/dashboard" ? "active" : ""} href="/dashboard">
            Dashboard
          </Link>
          <Link className={router.pathname === "/scan" ? "active" : ""} href="/scan">
            Scan
          </Link>
          <Link className={router.pathname === "/results" ? "active" : ""} href="/results">
            Results
          </Link>
          <Link className={router.pathname === "/journal" ? "active" : ""} href="/journal">
            Journal
          </Link>
          <Link className={router.pathname === "/history" ? "active" : ""} href="/history">
            History
          </Link>
          <Link className={router.pathname === "/settings" ? "active" : ""} href="/settings">
            Profile
          </Link>
        </div>
        <div className="app-actions">
          {!isAuthed && (
            <>
              <Link className="app-store-badge" href="/login">
                Log in
              </Link>
              <Link className="app-store-badge is-primary" href="/signup">
                Sign up
              </Link>
            </>
          )}
          {isAuthed && (
            <>
              <span className="chip d-none d-md-inline">{name || "Account"}</span>
              <button className="app-store-badge" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <div className="container app-links d-flex d-lg-none mt-2">
        <Link className={router.pathname === "/" ? "active" : ""} href="/">
          Home
        </Link>
        <Link className={router.pathname === "/dashboard" ? "active" : ""} href="/dashboard">
          Dashboard
        </Link>
        <Link className={router.pathname === "/scan" ? "active" : ""} href="/scan">
          Scan
        </Link>
        <Link className={router.pathname === "/results" ? "active" : ""} href="/results">
          Results
        </Link>
        <Link className={router.pathname === "/journal" ? "active" : ""} href="/journal">
          Journal
        </Link>
        <Link className={router.pathname === "/history" ? "active" : ""} href="/history">
          History
        </Link>
        <Link className={router.pathname === "/settings" ? "active" : ""} href="/settings">
          Profile
        </Link>
      </div>
    </nav>
  )
}
