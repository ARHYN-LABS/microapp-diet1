import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  getPrefs,
  getProfile,
  savePrefs,
  updateProfile
} from "@wimf/shared"
import type { UserPrefs, UserProfile } from "@wimf/shared"
import { getToken } from "../lib/auth"
import MultiSelect from "../components/MultiSelect"
import { getHealthPrefs, setHealthPrefs } from "../lib/healthPrefs"
import {
  addActivity,
  addWeight,
  getActivePlanId,
  getActivities,
  getGoals,
  getPlans,
  getReminders,
  getWeights,
  setActivePlan,
  setGoals,
  setPlans,
  setReminders
} from "../lib/tracking"

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"

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

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export default function Settings() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [prefs, setPrefs] = useState<UserPrefs>(emptyPrefs)
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [allergens, setAllergens] = useState<string[]>([])
  const [goals, setGoalsState] = useState(getGoals())
  const [plans, setPlansState] = useState(getPlans())
  const [activePlanId, setActivePlanIdState] = useState(getActivePlanId())
  const [planName, setPlanName] = useState("")
  const [reminders, setRemindersState] = useState(getReminders())
  const [weights, setWeightsState] = useState(getWeights())
  const [activities, setActivitiesState] = useState(getActivities())
  const [weightInput, setWeightInput] = useState("")
  const [activityInput, setActivityInput] = useState("")
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
        const [prefsData] = await Promise.all([
          getPrefs({ baseUrl: apiBase, token }, profileData.id).catch(() => null)
        ])
        setProfile(profileData)
        if (prefsData) {
          setPrefs({ ...prefsData })
        }
        const storedHealth = getHealthPrefs()
        setRestrictions(storedHealth.restrictions)
        setAllergens(storedHealth.allergens)
      } catch {
        setStatus("Unable to load profile.")
      }
    }

    load()
  }, [token])

  const restrictionOptions = [
    { value: "vegan", label: "Vegan", description: "Excludes all animal-derived foods." },
    { value: "vegetarian", label: "Vegetarian", description: "No meat or fish; may include eggs/dairy." },
    { value: "gluten_free", label: "Gluten-Free", description: "No wheat, barley, or rye." },
    { value: "lactose_free", label: "Dairy-Free", description: "Avoids milk-based products." },
    { value: "nut_allergy", label: "Nut Allergies", description: "Avoid peanuts and tree nuts." },
    { value: "halal", label: "Halal", description: "Complies with Islamic dietary laws." },
    { value: "kosher", label: "Kosher", description: "Complies with Jewish dietary laws." },
    { value: "hindu", label: "Hindu", description: "Commonly restricts beef; some avoid all meat." },
    { value: "keto", label: "Keto", description: "High fat, low carb." },
    { value: "diabetic", label: "Diabetic", description: "Manages sugar and carbohydrates." },
    { value: "low_sodium", label: "Low-Sodium / Low-Fat", description: "Used for cardiovascular health." }
  ]

  const allergenOptions = [
    { value: "milk", label: "Milk" },
    { value: "eggs", label: "Eggs" },
    { value: "peanuts", label: "Peanuts" },
    { value: "tree_nuts", label: "Tree Nuts", description: "Almonds, walnuts, pecans, etc." },
    { value: "fish", label: "Fish", description: "Salmon, cod, flounder, etc." },
    { value: "shellfish", label: "Crustacean Shellfish", description: "Shrimp, crab, lobster." },
    { value: "wheat", label: "Wheat" },
    { value: "soy", label: "Soy" },
    { value: "sesame", label: "Sesame", description: "Recognized as major allergen (2023)." }
  ]

  const handleProfileSave = async () => {
    if (!token || !profile) return
    setStatus("Saving profile...")
    try {
      const saved = await updateProfile({ baseUrl: apiBase, token }, profile)
      setProfile(saved)
      setStatus("Profile updated.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handlePrefsSave = async () => {
    if (!token || !profile) return
    setStatus("Saving preferences...")
    try {
      const saved = await savePrefs({ baseUrl: apiBase, token }, { ...prefs, userId: profile.id })
      setPrefs(saved)
      setStatus("Preferences saved.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handleGoalsSave = () => {
    setGoals(goals)
    setStatus("Goals updated.")
  }

  const handleCreatePlan = () => {
    if (!planName.trim()) {
      setStatus("Enter a plan name.")
      return
    }
    const newPlan = {
      id: `${Date.now()}`,
      name: planName.trim(),
      createdAt: new Date().toISOString(),
      goals
    }
    const updated = [...plans, newPlan]
    setPlans(updated)
    setPlansState(updated)
    setPlanName("")
    setStatus("Plan created.")
  }

  const handleActivatePlan = (planId: string) => {
    setActivePlan(planId)
    setActivePlanIdState(planId)
    const plan = plans.find((item) => item.id === planId)
    if (plan) {
      setGoalsState(plan.goals)
      setGoals(plan.goals)
      setStatus("Plan activated.")
    }
  }

  const handleReminderSave = () => {
    setReminders(reminders)
    setStatus("Reminders saved locally.")
  }

  const handleAddWeight = () => {
    const value = Number(weightInput)
    if (!Number.isFinite(value)) {
      setStatus("Enter a valid weight.")
      return
    }
    const entry = { id: `${Date.now()}`, date: new Date().toISOString().slice(0, 10), weightKg: value }
    const updated = addWeight(entry)
    setWeightsState(updated)
    setWeightInput("")
    setStatus("Weight logged.")
  }

  const handleAddActivity = () => {
    const value = Number(activityInput)
    if (!Number.isFinite(value)) {
      setStatus("Enter a valid calorie value.")
      return
    }
    const entry = { id: `${Date.now()}`, date: new Date().toISOString().slice(0, 10), caloriesBurned: value }
    const updated = addActivity(entry)
    setActivitiesState(updated)
    setActivityInput("")
    setStatus("Activity logged.")
  }

  const handleHealthSave = () => {
    setHealthPrefs({ restrictions, allergens })
    setStatus("Health preferences saved locally.")
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
          <h1 className="mb-1">Profile & preferences</h1>
          <div className="text-muted">Keep your data updated for better personalization.</div>
        </div>
        <span className="chip">Account</span>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Profile</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input
                  className="form-control"
                  value={profile.fullName ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => (prev ? { ...prev, fullName: event.target.value } : prev))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Mobile number</label>
                <input
                  className="form-control"
                  value={profile.mobileNumber ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev ? { ...prev, mobileNumber: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Age</label>
                <input
                  className="form-control"
                  value={profile.age ?? ""}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev ? { ...prev, age: toNumberOrNull(event.target.value) ?? undefined } : prev
                    )
                  }
                />
              </div>
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label className="form-label">Race (optional)</label>
                <input
                  className="form-control"
                  value={profile.race ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => (prev ? { ...prev, race: event.target.value } : prev))
                  }
                />
              </div>
              <div className="col-md-4">
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
              <div className="col-md-4">
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
              <div className="col-md-4">
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
              <div className="col-md-6">
                <label className="form-label">Dietary preference</label>
                <select
                  className="form-select"
                  value={profile.dietaryPreference ?? "none"}
                  onChange={(event) =>
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            dietaryPreference: event.target.value as UserProfile["dietaryPreference"]
                          }
                        : prev
                    )
                  }
                >
                  <option value="none">None</option>
                  <option value="halal">Halal</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Daily calorie goal</label>
                <input className="form-control" value={profile.dailyCalorieGoal ?? ""} disabled />
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={handleProfileSave}>
              Save profile
            </button>
          </div>

          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Common dietary restrictions</h2>
            <MultiSelect
              label="Select restrictions"
              options={restrictionOptions}
              selected={restrictions}
              onChange={setRestrictions}
              placeholder="Search dietary restrictions"
            />
          </div>

          <div className="glass-card mb-3">
            <h2 className="h5 mb-3">Allergens</h2>
            <MultiSelect
              label="Select allergens"
              options={allergenOptions}
              selected={allergens}
              onChange={setAllergens}
              placeholder="Search allergens"
            />
            <button className="btn btn-primary mt-2" onClick={handleHealthSave}>
              Save health preferences
            </button>
          </div>

          <div className="glass-card">
            <h2 className="h5 mb-3">Personalized flags</h2>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={prefs.halalCheckEnabled}
                onChange={(event) =>
                  setPrefs((prev) => ({ ...prev, halalCheckEnabled: event.target.checked }))
                }
              />
              <label className="form-check-label">Enable halal check</label>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.vegetarian}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, vegetarian: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Vegetarian</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.vegan}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, vegan: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Vegan</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!prefs.sensitiveStomach}
                    onChange={(event) =>
                      setPrefs((prev) => ({ ...prev, sensitiveStomach: event.target.checked }))
                    }
                  />
                  <label className="form-check-label">Sensitive stomach</label>
                </div>
              </div>
            </div>

            <button className="btn btn-primary mt-4" onClick={handlePrefsSave}>
              Save preferences
            </button>
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Goals & limits</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Daily calories</label>
                <input
                  className="form-control"
                  value={goals.caloriesTarget}
                  onChange={(event) =>
                    setGoalsState((prev) => ({ ...prev, caloriesTarget: Number(event.target.value) }))
                  }
                />
              </div>
            </div>
            <button className="btn btn-outline-light mt-3" onClick={handleGoalsSave}>
              Save goals
            </button>
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Plans</h2>
            <div className="d-flex gap-2 mb-3">
              <input
                className="form-control"
                placeholder="Plan name"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
              />
              <button className="btn btn-primary" onClick={handleCreatePlan}>
                Create
              </button>
            </div>
            {plans.length === 0 && <div className="text-muted">No plans yet.</div>}
            {plans.map((plan) => (
              <div className="d-flex justify-content-between align-items-center mb-2" key={plan.id}>
                <div>
                  <div className="fw-semibold">{plan.name}</div>
                  <div className="text-muted small">Calories {plan.goals.caloriesTarget}</div>
                </div>
                <button
                  className={`btn btn-sm ${activePlanId === plan.id ? "btn-primary" : "btn-outline-light"}`}
                  onClick={() => handleActivatePlan(plan.id)}
                >
                  {activePlanId === plan.id ? "Active" : "Activate"}
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Reminders</h2>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={reminders.enabled}
                onChange={(event) =>
                  setRemindersState((prev) => ({ ...prev, enabled: event.target.checked }))
                }
              />
              <label className="form-check-label">Enable reminders</label>
            </div>
            <label className="form-label">Reminder times (comma-separated HH:MM)</label>
            <input
              className="form-control"
              value={reminders.times.join(", ")}
              onChange={(event) =>
                setRemindersState((prev) => ({
                  ...prev,
                  times: event.target.value
                    .split(",")
                    .map((time) => time.trim())
                    .filter(Boolean)
                }))
              }
            />
            <button className="btn btn-outline-light mt-3" onClick={handleReminderSave}>
              Save reminders
            </button>
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Weight</h2>
            <div className="d-flex gap-2 mb-3">
              <input
                className="form-control"
                placeholder="Weight (kg)"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
              />
              <button className="btn btn-outline-light" onClick={handleAddWeight}>
                Add
              </button>
            </div>
            {weights.slice(-30).map((entry) => (
              <div className="text-muted small" key={entry.id}>
                {entry.date}: {entry.weightKg} kg
              </div>
            ))}
          </div>

          <div className="glass-card mt-3">
            <h2 className="h5 mb-3">Activity (manual)</h2>
            <div className="d-flex gap-2 mb-3">
              <input
                className="form-control"
                placeholder="Calories burned"
                value={activityInput}
                onChange={(event) => setActivityInput(event.target.value)}
              />
              <button className="btn btn-outline-light" onClick={handleAddActivity}>
                Add
              </button>
            </div>
            {activities.slice(-30).map((entry) => (
              <div className="text-muted small" key={entry.id}>
                {entry.date}: {entry.caloriesBurned} kcal
              </div>
            ))}
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
