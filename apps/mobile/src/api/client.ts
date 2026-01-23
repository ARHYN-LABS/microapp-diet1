import {
  analyzeFromImages,
  extractFromImages,
  getHistory,
  getPrefs,
  postHistory,
  savePrefs,
  type UserPrefs
} from "@wimf/shared"
import { apiBase } from "./config"

const apiConfig = { baseUrl: apiBase }

export async function fetchHistory(userId: string) {
  return getHistory(apiConfig, userId)
}

export async function saveHistory(payload: {
  userId: string
  extractedText?: any
  parsedIngredients?: string[]
  parsedNutrition?: any
  analysisSnapshot?: any
}) {
  return postHistory(apiConfig, payload)
}

export async function runExtract(formData: FormData) {
  return extractFromImages(apiConfig, formData)
}

export async function runAnalyze(formData: FormData) {
  return analyzeFromImages(apiConfig, formData)
}

export async function fetchPrefs(userId: string): Promise<UserPrefs> {
  return getPrefs(apiConfig, userId)
}

export async function updatePrefs(prefs: UserPrefs): Promise<UserPrefs> {
  return savePrefs(apiConfig, prefs)
}
