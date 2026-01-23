import { describe, expect, it } from "vitest"
import { calculateCaloriesPer50g, parseIngredients, parseNutrition } from "../src/parser"

describe("parseIngredients", () => {
  it("extracts ingredients list after label", () => {
    const text = "Ingredients: Water, Sugar, Natural Flavors, Citric Acid."
    const result = parseIngredients(text)
    expect(result).toEqual(["Water", "Sugar", "Natural Flavors", "Citric Acid"])
  })
})

describe("parseNutrition", () => {
  it("extracts calories and macros", () => {
    const text =
      "Serving Size 40g Calories 180 Protein 6g Total Carbohydrate 24g Sugars 12g Added Sugars 8g Sodium 220mg"
    const result = parseNutrition(text)
    expect(result?.calories).toBe(180)
    expect(result?.protein_g).toBe(6)
    expect(result?.carbs_g).toBe(24)
    expect(result?.sugar_g).toBe(12)
    expect(result?.addedSugar_g).toBe(8)
    expect(result?.sodium_mg).toBe(220)
    expect(result?.servingSizeG).toBe(40)
  })

  it("returns nulls when values are missing", () => {
    const text = "Nutrition Facts"
    const result = parseNutrition(text)
    expect(result).toBeNull()
  })
})

describe("calculateCaloriesPer50g", () => {
  it("uses calories per 100g when available", () => {
    const result = calculateCaloriesPer50g({
      caloriesPer100g: 200
    })
    expect(result).toBe(100)
  })

  it("uses serving size when calories per 100g is missing", () => {
    const result = calculateCaloriesPer50g({
      calories: 180,
      servingSizeG: 45
    })
    expect(result).toBeCloseTo(200, 1)
  })
})
