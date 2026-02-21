import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ScanHistory, UserPrefs, UserProfile } from "@wimf/shared"

const HISTORY_KEY = "wimf.history"
const HISTORY_KEY_PREFIX = "wimf.history."
const PREFS_KEY = "wimf.prefs"
const USER_KEY = "wimf.user_id"
const TOKEN_KEY = "wimf.token"
const PROFILE_KEY = "wimf.profile"
const LAST_ANALYSIS_KEY = "wimf.last_analysis"
const HEALTH_PREFS_KEY = "wimf.health_prefs"
const PROFILE_PREFS_KEY = "wimf.profile_prefs"
const SCAN_IMAGE_KEY = "wimf.scan_images"

let profileCache: UserProfile | null | undefined
let profilePrefsCache: ProfilePrefs | null | undefined

type HealthPrefs = {
  restrictions: string[]
  allergens: string[]
  allergyOther?: string
}

type ProfilePrefs = {
  photoUri?: string | null
  dob?: string | null
  country?: string | null
  alertEmail?: string
  dietaryOther?: string
  dietary: Record<string, boolean>
  allergies: Record<string, boolean>
  allergyOther?: string
  alerts: Record<string, boolean>
  sensitivities: Record<string, boolean>
  scoring: {
    allergies: number
    dietary: number
    processing: number
    strictMode: boolean
  }
}

const defaultProfilePrefs: ProfilePrefs = {
  photoUri: null,
  dob: null,
  country: null,
  alertEmail: "support@safe-plate.ai",
  dietaryOther: "",
  dietary: {},
  allergies: {},
  allergyOther: "",
  alerts: {
    highRisk: true,
    allergenDetected: true,
    nonCompliant: true,
    processed: true,
    highSodiumSugar: true,
    push: true,
    email: true
  },
  sensitivities: {
    hypertension: false,
    diabetic: false,
    heartHealthy: false,
    weightLoss: false
  },
  scoring: {
    allergies: 70,
    dietary: 60,
    processing: 40,
    strictMode: true
  }
}

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

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, PROFILE_KEY, USER_KEY])
  profileCache = null
  profilePrefsCache = null
}

export function getProfileCached(): UserProfile | null {
  return profileCache ?? null
}

export function getProfilePrefsCached(): ProfilePrefs {
  return profilePrefsCache || defaultProfilePrefs
}

export async function getProfile(): Promise<UserProfile | null> {
  if (profileCache !== undefined) return profileCache
  const raw = await AsyncStorage.getItem(PROFILE_KEY)
  if (!raw) {
    profileCache = null
    return null
  }
  try {
    profileCache = JSON.parse(raw) as UserProfile
    return profileCache
  } catch {
    profileCache = null
    return null
  }
}

export async function setProfile(profile: UserProfile): Promise<void> {
  profileCache = profile
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function getLastAnalysis(): Promise<unknown | null> {
  const raw = await AsyncStorage.getItem(LAST_ANALYSIS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export async function setLastAnalysis(analysis: unknown): Promise<void> {
  await AsyncStorage.setItem(LAST_ANALYSIS_KEY, JSON.stringify(analysis))
}

export async function getHealthPrefs(): Promise<HealthPrefs> {
  const raw = await AsyncStorage.getItem(HEALTH_PREFS_KEY)
  if (!raw) return { restrictions: [], allergens: [] }
  try {
    return JSON.parse(raw) as HealthPrefs
  } catch {
    return { restrictions: [], allergens: [] }
  }
}

export async function setHealthPrefs(prefs: HealthPrefs): Promise<void> {
  await AsyncStorage.setItem(HEALTH_PREFS_KEY, JSON.stringify(prefs))
}

export async function getProfilePrefs(): Promise<ProfilePrefs> {
  if (profilePrefsCache) return profilePrefsCache
  const raw = await AsyncStorage.getItem(PROFILE_PREFS_KEY)
  if (!raw) {
    profilePrefsCache = defaultProfilePrefs
    return defaultProfilePrefs
  }
  try {
    profilePrefsCache = { ...defaultProfilePrefs, ...(JSON.parse(raw) as ProfilePrefs) }
    return profilePrefsCache
  } catch {
    profilePrefsCache = defaultProfilePrefs
    return defaultProfilePrefs
  }
}

export async function setProfilePrefs(prefs: ProfilePrefs): Promise<void> {
  profilePrefsCache = { ...defaultProfilePrefs, ...prefs }
  await AsyncStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(prefs))
}

type ScanImageMap = Record<string, string>

export async function getScanImageMap(): Promise<ScanImageMap> {
  const raw = await AsyncStorage.getItem(SCAN_IMAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ScanImageMap
  } catch {
    return {}
  }
}

export async function setScanImageForId(id: string, uri: string): Promise<void> {
  const map = await getScanImageMap()
  map[id] = uri
  await AsyncStorage.setItem(SCAN_IMAGE_KEY, JSON.stringify(map))
}

export async function setScanImageForKey(key: string, uri: string): Promise<void> {
  const map = await getScanImageMap()
  map[key] = uri
  await AsyncStorage.setItem(SCAN_IMAGE_KEY, JSON.stringify(map))
}

export async function getScanImageForId(id: string): Promise<string | null> {
  const map = await getScanImageMap()
  return map[id] || null
}

const getHistoryCacheKey = async (userId?: string | null) => {
  const resolvedUserId = userId || (await AsyncStorage.getItem(USER_KEY))
  if (resolvedUserId) return `${HISTORY_KEY_PREFIX}${resolvedUserId}`
  return HISTORY_KEY
}

export async function getScanHistoryCache(userId?: string | null): Promise<ScanHistory[]> {
  const cacheKey = await getHistoryCacheKey(userId)
  const raw = await AsyncStorage.getItem(cacheKey)
  if (raw) {
    try {
      return JSON.parse(raw) as ScanHistory[]
    } catch {
      return []
    }
  }

  // Legacy one-key cache fallback. Keep only entries for current user.
  if (cacheKey !== HISTORY_KEY) {
    const legacyRaw = await AsyncStorage.getItem(HISTORY_KEY)
    if (!legacyRaw) return []
    try {
      const all = JSON.parse(legacyRaw) as ScanHistory[]
      const resolvedUserId = userId || (await AsyncStorage.getItem(USER_KEY))
      const filtered = resolvedUserId ? all.filter((item) => item.userId === resolvedUserId) : all
      await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered))
      return filtered
    } catch {
      return []
    }
  }
  return []
}

export async function setScanHistoryCache(items: ScanHistory[], userId?: string | null): Promise<void> {
  const cacheKey = await getHistoryCacheKey(userId)
  await AsyncStorage.setItem(cacheKey, JSON.stringify(items))
}

export async function cleanupScanImageCache(): Promise<void> {
  const map = await getScanImageMap()
  let changed = false
  const next: ScanImageMap = {}
  for (const [key, uri] of Object.entries(map)) {
    if (typeof uri !== "string") {
      changed = true
      continue
    }
    if (uri.startsWith("data:")) {
      changed = true
      continue
    }
    next[key] = uri
  }
  if (!changed) return
  if (Object.keys(next).length === 0) {
    await AsyncStorage.removeItem(SCAN_IMAGE_KEY)
  } else {
    await AsyncStorage.setItem(SCAN_IMAGE_KEY, JSON.stringify(next))
  }
}
