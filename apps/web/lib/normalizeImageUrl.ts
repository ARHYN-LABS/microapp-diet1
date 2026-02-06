import { apiBase } from "./apiBase"

export const normalizeImageUrl = (value?: string | null) => {
  if (!value) return null
  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("/uploads/")) return `${apiBase}${value}`
  if (value.startsWith("uploads/")) return `${apiBase}/${value}`
  return value
}
