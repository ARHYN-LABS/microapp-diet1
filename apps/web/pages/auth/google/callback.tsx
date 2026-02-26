import { useEffect } from "react"
import { useRouter } from "next/router"
import { setProfile, setToken } from "../../../lib/auth"

export default function GoogleCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const { token, userId, email, fullName, role, error } = router.query
    if (typeof error === "string") {
      router.replace(`/login?error=${encodeURIComponent(error)}`)
      return
    }
    if (typeof token === "string" && typeof userId === "string" && typeof email === "string") {
      setToken(token)
      setProfile({
        id: userId,
        fullName: typeof fullName === "string" ? fullName : undefined,
        email,
        role: typeof role === "string" ? role : undefined
      })
      router.replace("/dashboard")
      return
    }
    router.replace("/login?error=google_auth_failed")
  }, [router])

  return (
    <main className="container page-shell">
      <div className="text-muted">Signing you in...</div>
    </main>
  )
}
