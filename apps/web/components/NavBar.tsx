import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { clearToken, getProfile, getToken } from "../lib/auth"
import { normalizeImageUrl } from "../lib/normalizeImageUrl"

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role || null
  } catch {
    return null
  }
}

export default function NavBar() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = getToken()
    const profile = getProfile()
    setIsAuthed(!!token)
    setIsAdmin(getRoleFromToken(token) === "SUPER_ADMIN")
    setName(profile?.fullName || profile?.email || null)
    setAvatarUrl(normalizeImageUrl(profile?.avatarUrl) || null)
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [router.asPath])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearToken()
    setIsAuthed(false)
    setDropdownOpen(false)
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
            <div className="profile-dropdown d-none d-md-flex" ref={dropdownRef}>
              <button
                type="button"
                className="profile-dropdown-trigger"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {avatarUrl ? (
                  <img className="nav-avatar" src={avatarUrl} alt="Profile" />
                ) : (
                  <span className="nav-avatar-placeholder">
                    {(name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <svg
                  className={`dropdown-arrow ${dropdownOpen ? "is-open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="profile-dropdown-menu">
                  <Link
                    href="/settings"
                    className="profile-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>person</span>
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="profile-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="material-icons" style={{ fontSize: 18 }}>settings</span>
                    Settings
                  </Link>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item" onClick={handleLogout}>
                    <span className="material-icons" style={{ fontSize: 18 }}>logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
