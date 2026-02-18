import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <span className="site-footer-copy">© {new Date().getFullYear()} SafePlate AI</span>
        <nav className="site-footer-links" aria-label="Legal and app content">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/account-deletion">Account Deletion</Link>
          <Link href="/ads-disclosure">Ads Disclosure</Link>
          <Link href="/data-safety">Data Safety</Link>
          <Link href="/content-rating">Content Rating</Link>
        </nav>
      </div>
    </footer>
  )
}
