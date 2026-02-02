const fallbackApiBase = "http://76.13.100.119:4000"

export const apiBase =
  (process.env.NEXT_PUBLIC_API_BASE as string) || fallbackApiBase
