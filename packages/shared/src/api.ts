import type { OCRExtraction, ParsedData, ScanHistory, UserPrefs } from "./index"
import type { AnalyzeFromImagesResponse } from "./analyze"

type ApiConfig = {
  baseUrl: string
}

const withBase = (baseUrl: string, path: string) => {
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  return `${trimmed}${path}`
}

export async function getHistory(config: ApiConfig, userId: string): Promise<ScanHistory[]> {
  const response = await fetch(withBase(config.baseUrl, `/history?userId=${userId}`))
  if (!response.ok) {
    throw new Error("Failed to load history")
  }
  return (await response.json()) as ScanHistory[]
}

export async function postHistory(
  config: ApiConfig,
  payload: {
    userId: string
    analysisSnapshot?: AnalyzeFromImagesResponse
    extractedText?: OCRExtraction
    parsedIngredients?: string[]
    parsedNutrition?: ParsedData["nutrition"]
  }
): Promise<ScanHistory> {
  const response = await fetch(withBase(config.baseUrl, "/history"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    body: formData
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to analyze images")
  }

  return (await response.json()) as AnalyzeFromImagesResponse
}

export async function getPrefs(config: ApiConfig, userId: string): Promise<UserPrefs> {
  const response = await fetch(withBase(config.baseUrl, `/prefs?userId=${userId}`))
  if (!response.ok) {
    throw new Error("Failed to load preferences")
  }
  return (await response.json()) as UserPrefs
}

export async function savePrefs(config: ApiConfig, prefs: UserPrefs): Promise<UserPrefs> {
  const response = await fetch(withBase(config.baseUrl, "/prefs"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs)
  })
  if (!response.ok) {
    throw new Error("Failed to save preferences")
  }
  return (await response.json()) as UserPrefs
}
