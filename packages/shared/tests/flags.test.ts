import { describe, expect, it } from "vitest"
import type { NutritionParsed, UserPrefs } from "../src"
import { evaluateFlags } from "../src/flags"

const ingredients = ["Potatoes", "Vegetable Oil", "Salt", "Gelatin"]
const nutrition: NutritionParsed = {
  calories: 220,
  protein_g: 3,
  carbs_g: 26,
  sugar_g: 1,
  sodium_mg: 480
}
const prefs: UserPrefs = {
  userId: "user-1",
  halalCheckEnabled: true,
  lowSodiumMgLimit: 200
}

describe("evaluateFlags", () => {
  it("flags high sodium as fail", () => {
    const flags = evaluateFlags(ingredients, nutrition, prefs)
    const sodium = flags.find((flag) => flag.flag === "Low sodium")
    expect(sodium?.status).toBe("fail")
  })

  it("includes halal check when enabled", () => {
    const flags = evaluateFlags(ingredients, nutrition, prefs)
    const halal = flags.find((flag) => flag.flag === "Halal check")
    expect(halal).toBeDefined()
  })
})
