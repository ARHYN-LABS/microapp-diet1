const KEY = "wimf.scan_images"
const LAST_KEY = "wimf.last_scan_image"

type ScanImageMap = Record<string, string>

const readMap = (): ScanImageMap => {
  if (typeof window === "undefined") return {}
  const raw = window.localStorage.getItem(KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ScanImageMap
  } catch {
    return {}
  }
}

export const setScanImage = (id: string, dataUrl: string) => {
  if (typeof window === "undefined") return
  const map = readMap()
  map[id] = dataUrl
  window.localStorage.setItem(KEY, JSON.stringify(map))
}

export const getScanImage = (id: string): string | null => {
  if (typeof window === "undefined") return null
  const map = readMap()
  return map[id] || null
}

export const setLastScanImage = (dataUrl: string) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LAST_KEY, dataUrl)
}

export const getLastScanImage = (): string | null => {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(LAST_KEY)
}
