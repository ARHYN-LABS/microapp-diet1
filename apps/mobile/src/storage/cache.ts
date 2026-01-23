import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ScanHistory, UserPrefs } from "@wimf/shared"

const HISTORY_KEY = "wimf.history"
const PREFS_KEY = "wimf.prefs"
const USER_KEY = "wimf.user_id"

export async function getUserPrefs(): Promise<UserPrefs | null> {
  const raw = await AsyncStorage.getItem(PREFS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserPrefs
  } catch {
    return null
  }
}

export async function setUserPrefs(prefs: UserPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_KEY)
}

export async function setUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, userId)
}

export async function getScanHistoryCache(): Promise<ScanHistory[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ScanHistory[]
  } catch {
    return []
  }
}

export async function setScanHistoryCache(items: ScanHistory[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}
