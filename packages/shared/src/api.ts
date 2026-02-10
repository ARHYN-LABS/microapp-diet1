import type {
  CalorieSummary,
  MedicalCondition,
  OCRExtraction,
  ParsedData,
  ProfilePrefs,
  ScanHistory,
  UserPrefs,
  UserProfile
} from "./index"
import type { AnalyzeFromImagesResponse } from "./analyze"

type ApiConfig = {
  baseUrl: string
  token?: string
}

const withBase = (baseUrl: string, path: string) => {
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  return `${trimmed}${path}`
}

const authHeaders = (config: ApiConfig, extra?: Record<string, string>) => {
  const headers: Record<string, string> = { ...(extra || {}) }
  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`
  }
  return headers
}

type HistoryQuery = {
  userId?: string
  email?: string
}

const buildHistoryQuery = (input?: string | HistoryQuery) => {
  if (!input) return ""
  if (typeof input === "string") {
    return `?userId=${encodeURIComponent(input)}`
  }
  const params = new URLSearchParams()
  if (input.userId) params.set("userId", input.userId)
  if (input.email) params.set("email", input.email)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export async function getHistory(
  config: ApiConfig,
  input?: string | HistoryQuery
): Promise<ScanHistory[]> {
  const query = buildHistoryQuery(input)
  const response = await fetch(withBase(config.baseUrl, `/history${query}`), {
    headers: authHeaders(config, {
      "Cache-Control": "no-cache",
      Pragma: "no-cache"
    })
  })
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || ""
    let detail = ""
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null)
      detail = payload?.error || payload?.message || JSON.stringify(payload)
    } else {
      detail = await response.text().catch(() => "")
    }
    const suffix = detail ? ` - ${detail}` : ""
    throw new Error(`History ${response.status}${suffix}`)
  }
  return (await response.json()) as ScanHistory[]
}

export async function postHistory(
  config: ApiConfig,
  payload: {
    userId: string
    imageUrl?: string | null
    analysisSnapshot?: AnalyzeFromImagesResponse
    extractedText?: OCRExtraction
    parsedIngredients?: string[]
    parsedNutrition?: ParsedData["nutrition"]
  }
): Promise<ScanHistory> {
  const response = await fetch(withBase(config.baseUrl, "/history"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error("Failed to save history")
  }
  return (await response.json()) as ScanHistory
}

export async function extractFromImages(
  config: ApiConfig,
  formData: FormData
): Promise<{ extractedText: OCRExtraction; parsed: ParsedData; confidences: ParsedData["confidences"] }> {
  const response = await fetch(withBase(config.baseUrl, "/extract"), {
    method: "POST",
    headers: authHeaders(config),
    body: formData
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to extract text")
  }

  return (await response.json()) as {
    extractedText: OCRExtraction
    parsed: ParsedData
    confidences: ParsedData["confidences"]
  }
}

export async function analyzeFromImages(
  config: ApiConfig,
  formData: FormData
): Promise<AnalyzeFromImagesResponse> {
  const response = await fetch(withBase(config.baseUrl, "/analyze-from-images"), {
    method: "POST",
    headers: authHeaders(config),
    body: formData
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to analyze images")
  }

  return (await response.json()) as AnalyzeFromImagesResponse
}

export async function getPrefs(config: ApiConfig, userId: string): Promise<UserPrefs> {
  const response = await fetch(withBase(config.baseUrl, `/prefs?userId=${userId}`), {
    headers: authHeaders(config)
  })
  if (!response.ok) {
    throw new Error("Failed to load preferences")
  }
  return (await response.json()) as UserPrefs
}

export async function savePrefs(config: ApiConfig, prefs: UserPrefs): Promise<UserPrefs> {
  const response = await fetch(withBase(config.baseUrl, "/prefs"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(prefs)
  })
  if (!response.ok) {
    throw new Error("Failed to save preferences")
  }
  return (await response.json()) as UserPrefs
}

export async function getProfilePrefs(config: ApiConfig): Promise<ProfilePrefs> {
  const response = await fetch(withBase(config.baseUrl, "/profile-prefs"), {
    headers: authHeaders(config)
  })
  if (!response.ok) {
    throw new Error("Failed to load profile preferences")
  }
  return (await response.json()) as ProfilePrefs
}

export async function saveProfilePrefs(
  config: ApiConfig,
  prefs: ProfilePrefs
): Promise<ProfilePrefs> {
  const response = await fetch(withBase(config.baseUrl, "/profile-prefs"), {
    method: "PUT",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(prefs)
  })
  if (!response.ok) {
    throw new Error("Failed to save profile preferences")
  }
  return (await response.json()) as ProfilePrefs
}

export async function signUp(
  config: ApiConfig,
  payload: { fullName: string; email: string; password: string }
): Promise<{ token: string; profile: UserProfile }> {
  const response = await fetch(withBase(config.baseUrl, "/auth/signup"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to sign up")
  }
  return (await response.json()) as { token: string; profile: UserProfile }
}

export async function logIn(
  config: ApiConfig,
  payload: { email: string; password: string }
): Promise<{ token: string; profile: UserProfile }> {
  const response = await fetch(withBase(config.baseUrl, "/auth/login"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to log in")
  }
  return (await response.json()) as { token: string; profile: UserProfile }
}

export async function requestPasswordReset(
  config: ApiConfig,
  payload: { email: string }
): Promise<{ message: string; token?: string }> {
  const response = await fetch(withBase(config.baseUrl, "/auth/forgot-password"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to request reset")
  }
  return (await response.json()) as { message: string; token?: string }
}

export async function resetPassword(
  config: ApiConfig,
  payload: { email: string; token: string; newPassword: string }
): Promise<{ message: string }> {
  const response = await fetch(withBase(config.baseUrl, "/auth/reset-password"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to reset password")
  }
  return (await response.json()) as { message: string }
}

export async function getProfile(config: ApiConfig): Promise<UserProfile> {
  const response = await fetch(withBase(config.baseUrl, "/profile"), {
    headers: authHeaders(config)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to load profile")
  }
  return (await response.json()) as UserProfile
}

export async function updateProfile(
  config: ApiConfig,
  payload: Partial<UserProfile>
): Promise<UserProfile> {
  const response = await fetch(withBase(config.baseUrl, "/profile"), {
    method: "PUT",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to update profile")
  }
  return (await response.json()) as UserProfile
}

export async function getConditions(config: ApiConfig): Promise<MedicalCondition[]> {
  const response = await fetch(withBase(config.baseUrl, "/conditions"), {
    headers: authHeaders(config)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to load conditions")
  }
  return (await response.json()) as MedicalCondition[]
}

export async function updateConditions(
  config: ApiConfig,
  payload: MedicalCondition[]
): Promise<MedicalCondition[]> {
  const response = await fetch(withBase(config.baseUrl, "/conditions"), {
    method: "PUT",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify({ conditions: payload })
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to update conditions")
  }
  return (await response.json()) as MedicalCondition[]
}

export async function addCalories(
  config: ApiConfig,
  payload: { calories: number; source?: string }
): Promise<CalorieSummary> {
  const response = await fetch(withBase(config.baseUrl, "/calories/consume"), {
    method: "POST",
    headers: authHeaders(config, { "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to add calories")
  }
  return (await response.json()) as CalorieSummary
}

export async function getTodayCalories(config: ApiConfig): Promise<CalorieSummary> {
  const response = await fetch(withBase(config.baseUrl, "/calories/today"), {
    headers: authHeaders(config)
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to load calories")
  }
  return (await response.json()) as CalorieSummary
}
