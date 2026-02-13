import {
  addCalories,
  analyzeFromImages,
  extractFromImages,
  getHistory,
  getProfile,
  getConditions,
  getBillingSummary,
  getTodayCalories,
  getPrefs,
  getProfilePrefs,
  logIn,
  postHistory,
  createBillingCheckout,
  createBillingPortal,
  savePrefs,
  saveProfilePrefs,
  signUp,
  updateConditions,
  updateProfile,
  type ProfilePrefs,
  type UserPrefs
} from "@wimf/shared"
import { apiBase } from "./config"
import { getToken } from "../storage/cache"

const getConfig = async () => {
  const token = await getToken()
  return { baseUrl: apiBase, token: token || undefined }
}

export async function fetchHistory(userId: string, email?: string | null) {
  const config = await getConfig()
  const maxAttempts = 3
  let attempt = 0
  let lastError: unknown

  const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error("Request timed out")
        ;(error as Error & { code?: string }).code = "ETIMEDOUT"
        reject(error)
      }, timeoutMs)
    })
    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const shouldRetry = (error: unknown) => {
    const message = (error as Error)?.message?.toLowerCase() || ""
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("failed to load history")
    )
  }

  while (attempt < maxAttempts) {
    try {
      return await withTimeout(getHistory(config, { userId, email: email || undefined }), 20000)
    } catch (error) {
      lastError = error
      attempt += 1
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error
      }
      const delayMs = 500 * attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to load history")
}

export async function saveHistory(payload: {
  userId: string
  imageUrl?: string | null
  extractedText?: any
  parsedIngredients?: string[]
  parsedNutrition?: any
  analysisSnapshot?: any
}) {
  const config = await getConfig()
  return postHistory(config, payload)
}

export async function runExtract(formData: FormData) {
  const config = await getConfig()
  return extractFromImages(config, formData)
}

export async function runAnalyze(formData: FormData) {
  const config = await getConfig()

  const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error("Request timed out")
        ;(error as Error & { code?: string }).code = "ETIMEDOUT"
        reject(error)
      }, timeoutMs)
    })
    try {
      return await Promise.race([promise, timeoutPromise])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  return withTimeout(analyzeFromImages(config, formData), 30000)
}

export async function fetchPrefs(userId: string): Promise<UserPrefs> {
  const config = await getConfig()
  return getPrefs(config, userId)
}

export async function updatePrefs(prefs: UserPrefs): Promise<UserPrefs> {
  const config = await getConfig()
  return savePrefs(config, prefs)
}

export async function fetchProfilePrefs(): Promise<ProfilePrefs> {
  const config = await getConfig()
  return getProfilePrefs(config)
}

export async function updateProfilePrefs(prefs: ProfilePrefs): Promise<ProfilePrefs> {
  const config = await getConfig()
  return saveProfilePrefs(config, prefs)
}

export async function signUpUser(payload: { fullName: string; email: string; password: string }) {
  const config = await getConfig()
  return signUp(config, payload)
}

export async function logInUser(payload: { email: string; password: string }) {
  const config = await getConfig()
  return logIn(config, payload)
}

export async function fetchProfile() {
  const config = await getConfig()
  return getProfile(config)
}

export async function saveProfile(payload: any) {
  const config = await getConfig()
  return updateProfile(config, payload)
}

export async function fetchConditions() {
  const config = await getConfig()
  return getConditions(config)
}

export async function saveConditions(payload: any) {
  const config = await getConfig()
  return updateConditions(config, payload)
}

export async function fetchTodayCalories() {
  const config = await getConfig()
  return getTodayCalories(config)
}

export async function addCaloriesToLog(payload: { calories: number; source?: string }) {
  const config = await getConfig()
  return addCalories(config, payload)
}

export async function uploadProfilePhoto(uri: string) {
  const config = await getConfig()
  if (!config.token) {
    throw new Error("Unauthorized")
  }
  const formData = new FormData()
  formData.append(
    "photo",
    {
      uri,
      name: "avatar.jpg",
      type: "image/jpeg"
    } as unknown as Blob
  )
  const response = await fetch(`${config.baseUrl}/profile/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`
    },
    body: formData
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to upload photo")
  }
  return response.json()
}

export async function fetchBillingSummary() {
  const config = await getConfig()
  return getBillingSummary(config)
}

export async function startBillingCheckout(planName: string) {
  const config = await getConfig()
  return createBillingCheckout(config, { planName })
}

export async function startBillingPortal() {
  const config = await getConfig()
  return createBillingPortal(config)
}
