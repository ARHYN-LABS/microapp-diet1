import Constants from "expo-constants"

const extra = Constants.expoConfig?.extra || {}
const fallbackApiBase = "https://api.safe-plate.ai"

const normalizeApiBase = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const withScheme = trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    const host = url.hostname
    const isIp = /^[0-9.]+$/.test(host) || host.includes(":")
    if (isIp) {
      return fallbackApiBase
    }
    return url.origin
  } catch {
    return null
  }
}

export const apiBase =
  normalizeApiBase(process.env.EXPO_PUBLIC_API_BASE as string) ||
  normalizeApiBase(extra.apiBase as string) ||
  fallbackApiBase

export const defaultUserId =
  (process.env.EXPO_PUBLIC_USER_ID as string) ||
  (extra.userId as string) ||
  "demo-user-1"
