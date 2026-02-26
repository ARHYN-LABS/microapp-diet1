import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { getPrefs, getProfile, getProfilePrefs, savePrefs, saveProfilePrefs, updateProfile } from "@wimf/shared"
import type { ProfilePrefs, UserPrefs, UserProfile } from "@wimf/shared"
import { getToken, setProfile as persistProfile } from "../lib/auth"
import { getHealthPrefs, setHealthPrefs } from "../lib/healthPrefs"
import { getProfilePrefs as getLocalProfilePrefs, setProfilePrefs } from "../lib/profilePrefs"
import { apiBase } from "../lib/apiBase"
import { normalizeImageUrl } from "../lib/normalizeImageUrl"

const emptyPrefs: UserPrefs = {
  userId: "unknown",
  halalCheckEnabled: false,
  lowSodiumMgLimit: null,
  lowSugarGlimit: null,
  lowCarbGlimit: null,
  lowCalorieLimit: null,
  highProteinGtarget: null,
  vegetarian: false,
  vegan: false,
  sensitiveStomach: false
}

const countryOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
]

const emoji = (code: number) => String.fromCodePoint(code)

const gfcoIcon = (
  <span className="gfco-icon" aria-hidden>
    <span className="gfco-text">GF</span>
    <span className="gfco-slash" />
  </span>
)

const dietaryToggles = [
  { key: "halal", label: "Halal", icon: <span aria-hidden>{emoji(0x262a)}</span>, color: "#1ABC9C" },
  { key: "kosher", label: "Kosher", icon: <span aria-hidden>{emoji(0x2721)}</span>, color: "#2C7BE5" },
  { key: "vegetarian", label: "Vegetarian", icon: <span aria-hidden>{emoji(0x1f957)}</span>, color: "#22C55E" },
  { key: "vegan", label: "Vegan", icon: <span aria-hidden>{emoji(0x1f33f)}</span>, color: "#16A34A" },
  { key: "pescatarian", label: "Pescatarian", icon: <span aria-hidden>{emoji(0x1f41f)}</span>, color: "#3B82F6" },
  { key: "keto", label: "Keto", icon: <span aria-hidden>{emoji(0x1f525)}</span>, color: "#F97316" },
  { key: "low_carb", label: "Low Carb", icon: <span aria-hidden>{emoji(0x26a1)}</span>, color: "#14B8A6" },
  { key: "low_sodium", label: "Low Sodium", icon: <span aria-hidden>{emoji(0x1f9c2)}</span>, color: "#0EA5E9" },
  { key: "low_sugar", label: "Low Sugar", icon: <span aria-hidden>{emoji(0x1fad0)}</span>, color: "#E11D48" },
  { key: "high_protein", label: "High Protein", icon: <span aria-hidden>{emoji(0x1f969)}</span>, color: "#2563EB" },
  { key: "gluten_free", label: "Gluten-Free", icon: gfcoIcon, color: "transparent" },
  { key: "dairy_free", label: "Dairy-Free", icon: <span aria-hidden>{emoji(0x1f95b)}</span>, color: "#8B5CF6" }
]

const allergyChecks = [
  { key: "peanuts", label: "Peanuts", icon: <span aria-hidden>{emoji(0x1f95c)}</span>, color: "#E63946" },
  { key: "tree_nuts", label: "Tree Nuts", icon: <span aria-hidden>{emoji(0x1f330)}</span>, color: "#B45309" },
  { key: "dairy", label: "Dairy", icon: <span aria-hidden>{emoji(0x1f95b)}</span>, color: "#2563EB" },
  { key: "eggs", label: "Eggs", icon: <span aria-hidden>{emoji(0x1f95a)}</span>, color: "#F59E0B" },
  { key: "shellfish", label: "Shellfish", icon: <span aria-hidden>{emoji(0x1f990)}</span>, color: "#EF4444" },
  { key: "fish", label: "Fish", icon: <span aria-hidden>{emoji(0x1f41f)}</span>, color: "#3B82F6" },
  { key: "soy", label: "Soy", icon: <span aria-hidden>{emoji(0x1fadb)}</span>, color: "#22C55E" },
  { key: "wheat_gluten", label: "Wheat / Gluten", icon: <span aria-hidden>{emoji(0x1f33e)}</span>, color: "#F97316" },
  { key: "sesame", label: "Sesame", icon: <span aria-hidden>{emoji(0x1f33c)}</span>, color: "#F59E0B" },
  { key: "sulfites", label: "Sulfites", icon: <span aria-hidden>{emoji(0x26a0)}</span>, color: "#EF4444" }
]

const alertToggles = [
  { key: "highRisk", label: "High-Risk Ingredients" },
  { key: "allergenDetected", label: "Allergen Detected" },
  { key: "nonCompliant", label: "Non-Compliant Food" },
  { key: "processed", label: "Highly Processed Foods" },
  { key: "highSodiumSugar", label: "High Sodium / Sugar" },
  { key: "push", label: "Push Notifications" },
  { key: "email", label: "Email Alerts" }
]

const sensitivityToggles = [
  { key: "hypertension", label: "Hypertension-friendly" },
  { key: "diabetic", label: "Diabetic-friendly" },
  { key: "heartHealthy", label: "Heart-healthy" },
  { key: "weightLoss", label: "Weight-loss focused" }
]

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const withCacheBuster = (url: string) => {
  if (!url) return url
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}t=${Date.now()}`
}

export default function Settings() {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [prefs, setPrefs] = useState<UserPrefs>(emptyPrefs)
  const [profilePrefs, setProfilePrefsState] = useState<ProfilePrefs>(getLocalProfilePrefs())
  const [phoneNumber, setPhoneNumber] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    const storedToken = getToken()
    if (!storedToken) {
      router.push("/login")
      return
    }
    setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        const profileData = await getProfile({ baseUrl: apiBase, token })
        const prefsData = await getPrefs({ baseUrl: apiBase, token }, profileData.id).catch(() => null)
        const profilePrefsData = await getProfilePrefs({ baseUrl: apiBase, token }).catch(() => null)
        setProfile(profileData)
        persistProfile({
          id: profileData.id,
          fullName: profileData.fullName,
          email: profileData.email,
          avatarUrl: profileData.avatarUrl,
          role: profileData.role
        })
        if (prefsData) {
          setPrefs({ ...prefsData })
        }
        if (profileData.mobileNumber) {
          setPhoneNumber(profileData.mobileNumber)
        }
        const storedHealth = getHealthPrefs()
        const storedProfilePrefs = getLocalProfilePrefs()
        const sourcePrefs = profilePrefsData || storedProfilePrefs
        setProfilePrefsState({
          ...sourcePrefs,
          alertEmail: sourcePrefs.alertEmail || "support@safe-plate.ai",
          dietaryOther: sourcePrefs.dietaryOther || "",
          allergyOther: sourcePrefs.allergyOther || storedHealth.allergyOther || "",
          dietary: {
            ...sourcePrefs.dietary,
            ...Object.fromEntries(storedHealth.restrictions.map((item) => [item, true]))
          },
          allergies: {
            ...sourcePrefs.allergies,
            ...Object.fromEntries(storedHealth.allergens.map((item) => [item, true]))
          }
        })
      } catch {
        setStatus("Unable to load profile.")
      }
    }

    load()
  }, [token])

  const setDietaryToggle = (key: string, value: boolean) => {
    setProfilePrefsState((prev) => ({
      ...prev,
      dietary: { ...prev.dietary, [key]: value }
    }))
  }

  const setAllergyToggle = (key: string, value: boolean) => {
    setProfilePrefsState((prev) => ({
      ...prev,
      allergies: { ...prev.allergies, [key]: value }
    }))
  }

  const setAlertToggle = (key: string, value: boolean) => {
    setProfilePrefsState((prev) => ({
      ...prev,
      alerts: { ...prev.alerts, [key]: value }
    }))
  }

  const setSensitivityToggle = (key: string, value: boolean) => {
    setProfilePrefsState((prev) => ({
      ...prev,
      sensitivities: { ...prev.sensitivities, [key]: value }
    }))
  }

  const setScoringValue = (key: "allergies" | "dietary" | "processing", value: number) => {
    setProfilePrefsState((prev) => ({
      ...prev,
      scoring: { ...prev.scoring, [key]: value }
    }))
  }

  const handlePhoto = async (file: File | null) => {
    if (!file || !token || !profile) return
    setStatus("Uploading photo...")
    const formData = new FormData()
    formData.append("photo", file)
    try {
      const response = await fetch(`${apiBase}/profile/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Failed to upload photo")
      }
      const updated = (await response.json()) as UserProfile
      const normalizedAvatar = updated.avatarUrl ? normalizeImageUrl(updated.avatarUrl) : null
      const refreshedAvatar = normalizedAvatar ? withCacheBuster(normalizedAvatar) : null
      const nextProfile = refreshedAvatar ? { ...updated, avatarUrl: refreshedAvatar } : updated
      setProfile(nextProfile)
      persistProfile({
        id: nextProfile.id,
        fullName: nextProfile.fullName,
        email: nextProfile.email,
        avatarUrl: nextProfile.avatarUrl,
        role: nextProfile.role
      })
      setStatus("Photo updated.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handleProfileSave = async () => {
    if (!token || !profile) return
    setStatus("Saving profile...")
    try {
      const payload = {
        ...profile,
        mobileNumber: phoneNumber.trim()
      }
      const saved = await updateProfile({ baseUrl: apiBase, token }, payload)
      setProfile(saved)
      persistProfile({
        id: saved.id,
        fullName: saved.fullName,
        email: saved.email,
        avatarUrl: saved.avatarUrl,
        role: saved.role
      })
      setStatus("Profile updated.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handlePrefsSave = async () => {
    if (!token || !profile) return
    setStatus("Saving preferences...")
    try {
      const nextPrefs = {
        ...prefs,
        userId: profile.id,
        halalCheckEnabled: !!profilePrefs.dietary?.halal,
        vegetarian: !!profilePrefs.dietary?.vegetarian,
        vegan: !!profilePrefs.dietary?.vegan
      }
      const saved = await savePrefs({ baseUrl: apiBase, token }, nextPrefs)
      setPrefs(saved)
      const savedProfilePrefs = await saveProfilePrefs({ baseUrl: apiBase, token }, profilePrefs)
      setProfilePrefsState(savedProfilePrefs)
      setProfilePrefs(savedProfilePrefs)
      const restrictions = Object.entries(profilePrefs.dietary || {})
        .filter(([, value]) => value)
        .map(([key]) => key)
      if (profilePrefs.dietaryOther?.trim()) {
        restrictions.push(profilePrefs.dietaryOther.trim())
      }
      const allergens = Object.entries(profilePrefs.allergies || {})
        .filter(([, value]) => value)
        .map(([key]) => key)
      setHealthPrefs({ restrictions, allergens, allergyOther: profilePrefs.allergyOther || "" })
      setProfilePrefs(profilePrefs)
      setStatus("Preferences saved.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  if (!profile) {
    return (
      <main className="container page-shell">
        <div className="text-muted">Loading profile...</div>
      </main>
    )
  }

  return (
    <main className="container page-shell">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Profile</h1>
          <div className="text-muted">Manage your preferences and alerts.</div>
        </div>
        <span className="chip">SafePlate AI</span>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Personal information</h2>
            <div className="profile-photo-row mb-3">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-frame rounded-circle border d-flex align-items-center justify-content-center">
                  {profile.avatarUrl ? (
                    <img
                      src={normalizeImageUrl(profile.avatarUrl) || ""}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="text-muted small">Photo</span>
                  )}
                </div>
                <button
                  type="button"
                  className="profile-avatar-edit"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label="Edit photo"
                >
                  ✎
                </button>
              </div>
              <button
                type="button"
                className="btn btn-primary profile-photo-trigger"
                onClick={() => photoInputRef.current?.click()}
              >
                🖼 Upload photo
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(event) => handlePhoto(event.target.files?.[0] || null)}
              />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full name *</label>
                <input
                  className="form-control"
                  value={profile.fullName ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => (prev ? { ...prev, fullName: event.target.value } : prev))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email address *</label>
                <input className="form-control" value={profile.email ?? ""} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date of birth</label>
                <input
                  className="form-control"
                  value={profilePrefs.dob ?? ""}
                  onChange={(event) =>
                    setProfilePrefsState((prev) => ({ ...prev, dob: event.target.value }))
                  }
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Country</label>
                <select
                  className="form-select"
                  value={profilePrefs.country ?? ""}
                  onChange={(event) =>
                    setProfilePrefsState((prev) => ({ ...prev, country: event.target.value }))
                  }
                >
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={profile.gender ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev ? { ...prev, gender: event.target.value as UserProfile["gender"] } : prev
                    )
                  }
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone number</label>
                <input
                  className="form-control"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value)
                    setProfile((prev) =>
                      prev ? { ...prev, mobileNumber: event.target.value.trim() } : prev
                    )
                  }}
                  placeholder="Phone number"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Height (cm)</label>
                <input
                  className="form-control"
                  value={profile.heightCm ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev ? { ...prev, heightCm: toNumberOrNull(event.target.value) ?? undefined } : prev
                    )
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Weight (kg)</label>
                <input
                  className="form-control"
                  value={profile.weightKg ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev ? { ...prev, weightKg: toNumberOrNull(event.target.value) ?? undefined } : prev
                    )
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Activity level</label>
                <select
                  className="form-select"
                  value={profile.activityLevel ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            activityLevel: event.target.value as UserProfile["activityLevel"]
                          }
                        : prev
                    )
                  }
                >
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={handleProfileSave}>
              Save profile
            </button>
          </div>

          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Dietary restrictions</h2>
            <div className="row g-2 prefs-grid">
              {dietaryToggles.map((item) => (
                <div className="col-md-6" key={item.key}>
                  <div className="pref-option pref-option-switch">
                    <div className="pref-option-main">
                      <span className="pref-icon" style={{ backgroundColor: item.color }}>{item.icon}</span>
                      <span className="pref-label-text">{item.label}</span>
                    </div>
                    <input
                      className="form-check-input pref-switch"
                      type="checkbox"
                      checked={!!profilePrefs.dietary?.[item.key]}
                      onChange={(event) => setDietaryToggle(item.key, event.target.checked)}
                      aria-label={item.label}
                    />
                  </div>
                </div>
              ))}
            </div>
            <label className="form-label mt-3">Other (custom)</label>
            <input
              className="form-control"
              value={profilePrefs.dietaryOther ?? ""}
              onChange={(event) =>
                setProfilePrefsState((prev) => ({ ...prev, dietaryOther: event.target.value }))
              }
              placeholder="Add custom restriction"
            />
          </div>

          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Allergies & intolerances</h2>
            <div className="row g-2 prefs-grid">
              {allergyChecks.map((item) => (
                <div className="col-md-6" key={item.key}>
                  <label className="pref-option pref-option-check">
                    <input
                      className="form-check-input pref-checkbox"
                      type="checkbox"
                      checked={!!profilePrefs.allergies?.[item.key]}
                      onChange={(event) => setAllergyToggle(item.key, event.target.checked)}
                    />
                    <span className="pref-icon" style={{ backgroundColor: item.color }}>{item.icon}</span>
                    <span className="pref-label-text">{item.label}</span>
                  </label>
                </div>
              ))}
            </div>
            <label className="form-label mt-3">Other (custom)</label>
            <input
              className="form-control"
              value={profilePrefs.allergyOther ?? ""}
              onChange={(event) =>
                setProfilePrefsState((prev) => ({ ...prev, allergyOther: event.target.value }))
              }
            />
            <button className="btn btn-primary mt-3" onClick={handlePrefsSave}>
              Save preferences
            </button>
          </div>

          <div className="glass-card">
            <h2 className="h5 mb-3">Alert preferences</h2>
            <div className="text-muted small mb-2">
              Email alerts recipient: {profilePrefs.alertEmail || "support@safe-plate.ai"}
            </div>
            <div className="row g-2">
              {alertToggles.map((item) => (
                <div className="col-md-6" key={item.key}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!profilePrefs.alerts?.[item.key]}
                      onChange={(event) => setAlertToggle(item.key, event.target.checked)}
                    />
                    <label className="form-check-label">{item.label}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Health sensitivities</h2>
            <div className="row g-2">
              {sensitivityToggles.map((item) => (
                <div className="col-md-6" key={item.key}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!profilePrefs.sensitivities?.[item.key]}
                      onChange={(event) => setSensitivityToggle(item.key, event.target.checked)}
                    />
                    <label className="form-check-label">{item.label}</label>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-muted small mt-2">This app does not provide medical advice.</div>
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Scoring preferences</h2>
            <div className="mb-3">
              <label className="form-label">Prioritize allergies ({profilePrefs.scoring.allergies})</label>
              <input
                type="range"
                className="form-range"
                min={0}
                max={100}
                value={profilePrefs.scoring.allergies}
                onChange={(event) => setScoringValue("allergies", Number(event.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Prioritize dietary rules ({profilePrefs.scoring.dietary})</label>
              <input
                type="range"
                className="form-range"
                min={0}
                max={100}
                value={profilePrefs.scoring.dietary}
                onChange={(event) => setScoringValue("dietary", Number(event.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Prioritize processing level ({profilePrefs.scoring.processing})</label>
              <input
                type="range"
                className="form-range"
                min={0}
                max={100}
                value={profilePrefs.scoring.processing}
                onChange={(event) => setScoringValue("processing", Number(event.target.value))}
              />
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={profilePrefs.scoring.strictMode}
                onChange={(event) =>
                  setProfilePrefsState((prev) => ({
                    ...prev,
                    scoring: { ...prev.scoring, strictMode: event.target.checked }
                  }))
                }
              />
              <label className="form-check-label">Strict mode</label>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="metric-card">
            <div className="text-muted small">Disclaimer</div>
            <div className="fw-semibold">Educational, not medical advice.</div>
            <div className="text-muted small mt-2">
              Preferences adjust flags only. They never change the base score.
            </div>
          </div>
        </div>
      </div>

      {status && <div className="text-muted mt-3">{status}</div>}
    </main>
  )
}

