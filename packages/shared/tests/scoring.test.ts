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

  it("boosts whole fruit profiles into high score range", () => {
    const result = scoreFromParsed(["Apple"], {
      calories: 52,
      protein_g: 0.3,
      carbs_g: 14,
      sugar_g: 10.4,
      addedSugar_g: 0,
      sodium_mg: 1,
      fiber_g: 2.4
    })
    expect(result.value).toBeGreaterThanOrEqual(90)
    expect(result.category).toBe("Good")
  })

  it("does not apply whole-fruit boost to processed fruit products", () => {
    const result = scoreFromParsed(["Orange juice", "Sugar"], {
      calories: 120,
      protein_g: 1,
      carbs_g: 28,
      sugar_g: 24,
      addedSugar_g: 18,
      sodium_mg: 25,
      fiber_g: 0.2
    })
    expect(result.value).toBeLessThan(80)
  })

  it("applies a minimum score floor for very poor profiles", () => {
    const result = scoreFromParsed(["Hydrogenated oil", "Sugar", "Red 40"], {
      calories: 650,
      protein_g: 1,
      carbs_g: 80,
      sugar_g: 60,
      addedSugar_g: 50,
      sodium_mg: 1200,
      fiber_g: 0
    })
    expect(result.value).toBeGreaterThanOrEqual(10)
  })

  it("softens sugar/calorie penalties for dessert labels (still low)", () => {
    const result = scoreFromParsed(["Assorted donuts", "Sugar", "Wheat flour"], {
      calories: 450,
      protein_g: 5,
      carbs_g: 55,
      sugar_g: 30,
      addedSugar_g: 25,
      sodium_mg: 320,
      fiber_g: 1
    })
    expect(result.value).toBeGreaterThanOrEqual(10)
    expect(result.value).toBeLessThan(50)
  })
})
