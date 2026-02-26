import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { clearToken, getProfile, getToken } from "../lib/auth"
import { normalizeImageUrl } from "../lib/normalizeImageUrl"

export default function NavBar() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const token = getToken()
    const profile = getProfile()
    setIsAuthed(!!token)
    setIsAdmin(profile?.role === "SUPER_ADMIN")
    setName(profile?.fullName || profile?.email || null)
    setAvatarUrl(normalizeImageUrl(profile?.avatarUrl) || null)
    setMenuOpen(false)
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
            <img src="/favicon.png" alt="SafePlate AI" />
          </Link>
        </div>
        <div className="app-links app-links-desktop d-none d-lg-flex">
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
          <Link className={router.pathname === "/pricing" ? "active" : ""} href="/pricing">
            Pricing
          </Link>
          <Link className={router.pathname === "/settings" ? "active" : ""} href="/settings">
            Profile
          </Link>
          {isAdmin && (
            <Link className={router.pathname === "/admin" ? "active" : ""} href="/admin">
              Admin
            </Link>
          )}
        </div>
        <div className="app-actions">
          <button
            type="button"
            className="hamburger-btn d-inline-flex d-lg-none"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          {!isAuthed && (
            <>
              <Link className="app-store-badge d-none d-md-inline-flex" href="/login">
                Log in
              </Link>
              <Link className="app-store-badge is-primary d-none d-md-inline-flex" href="/signup">
                Sign up
              </Link>
            </>
          )}
          {isAuthed && (
            <>
              {avatarUrl ? (
                <img className="nav-avatar" src={avatarUrl} alt="Profile" />
              ) : null}
              <span className="chip d-none d-md-inline">{name || "Account"}</span>
              <button className="app-store-badge d-none d-md-inline-flex" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <div className={`container mobile-nav-panel ${menuOpen ? "is-open" : ""}`}>
        <div className="app-links app-links-mobile">
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
          <Link className={router.pathname === "/pricing" ? "active" : ""} href="/pricing">
            Pricing
          </Link>
          <Link className={router.pathname === "/settings" ? "active" : ""} href="/settings">
            Profile
          </Link>
          {isAdmin && (
            <Link className={router.pathname === "/admin" ? "active" : ""} href="/admin">
              Admin
            </Link>
          )}
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
            <button className="app-store-badge" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
