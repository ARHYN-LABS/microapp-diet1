import { apiBase } from "../api/config"

export const normalizeImageUrl = (value?: string | null) => {
  if (!value) return null
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value)
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${apiBase}${parsed.pathname}`
      }
    } catch {
      return value
    }
    return value
  }
  if (value.startsWith("/uploads/")) return `${apiBase}${value}`
  if (value.startsWith("uploads/")) return `${apiBase}/${value}`
  return value
}
