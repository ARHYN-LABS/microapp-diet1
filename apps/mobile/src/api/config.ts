import Constants from "expo-constants"

const extra = Constants.expoConfig?.extra || {}

export const apiBase =
  (process.env.EXPO_PUBLIC_API_BASE as string) ||
  (extra.apiBase as string) ||
  "http://localhost:4000"

export const defaultUserId =
  (process.env.EXPO_PUBLIC_USER_ID as string) ||
  (extra.userId as string) ||
  "demo-user-1"
