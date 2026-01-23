import { describe, expect, it } from "vitest"
import type { NutritionParsed } from "../src"
import { scoreFromParsed } from "../src/scoring"

const ingredients = ["Oats", "Almonds", "Sea Salt"]
const nutrition: NutritionParsed = {
  calories: 80,
  protein_g: 15,
  carbs_g: 10,
  sugar_g: 2,
  addedSugar_g: 0,
  sodium_mg: 50,
  fiber_g: 5
}

describe("scoreProduct", () => {
  it("returns Good category for balanced product", () => {
    const result = scoreFromParsed(ingredients, nutrition)
    expect(result.value).toBeGreaterThanOrEqual(70)
    expect(result.category).toBe("Good")
    expect(result.modelVersion).toBe("ai_v1")
    expect(result.explanations.length).toBeGreaterThan(0)
  })

  it("penalizes high sodium and added sugar", () => {
    const result = scoreFromParsed(ingredients, {
      ...nutrition,
      sodium_mg: 800,
      sugar_g: 20,
      addedSugar_g: 15
    })
    expect(result.value).toBeLessThan(70)
  })
})
