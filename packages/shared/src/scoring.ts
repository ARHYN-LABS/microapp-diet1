import type { NutritionParsed } from "./index"
import { findGlossaryMatch } from "./glossary"
import model from "./models/ai_v1.json"

export type ScoreExplanation = {
  label: string
  direction: "up" | "down"
  points: number
  reason: string
}

export type ScoreCategory = "Good" | "Moderate" | "Lower"

export type ScoreResult = {
  value: number
  category: ScoreCategory
  modelVersion: "ai_v1"
  explanations: ScoreExplanation[]
}

export type ExtractedFeatures = {
  ingredient_count: number
  ultra_processed_additive_count: number
  has_artificial_dye: number
  has_hydrogenated_oil: number
  sugar_g: number
  addedSugar_g: number
  sodium_mg: number
  fiber_g: number
  protein_g: number
  calories: number
  has_uncertain_ingredients: number
  has_animal_derived: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const featureLabels: Record<string, string> = {
  ingredient_count: "Ingredient count",
  ultra_processed_additive_count: "Ultra-processed additives",
  has_artificial_dye: "Artificial dyes",
  has_hydrogenated_oil: "Hydrogenated oils",
  sugar_g: "Sugar",
  addedSugar_g: "Added sugar",
  sodium_mg: "Sodium",
  fiber_g: "Fiber",
  protein_g: "Protein",
  calories: "Calories",
  has_uncertain_ingredients: "Uncertain ingredients",
  has_animal_derived: "Animal-derived ingredients"
}

const featureReasons: Record<string, string> = {
  ingredient_count: "More ingredients can indicate heavier processing.",
  ultra_processed_additive_count: "Processed additives add uncertainty.",
  has_artificial_dye: "Includes synthetic colors.",
  has_hydrogenated_oil: "Hydrogenated oils are more processed.",
  sugar_g: "Higher sugar per serving.",
  addedSugar_g: "Higher added sugar per serving.",
  sodium_mg: "Higher sodium per serving.",
  fiber_g: "Fiber supports a balanced profile.",
  protein_g: "Protein supports satiety.",
  calories: "Higher calories per serving.",
  has_uncertain_ingredients: "Unclear sourcing reduces confidence.",
  has_animal_derived: "Animal-derived ingredients impact some diets."
}

export const extractFeatures = (
  ingredients: string[],
  nutrition: NutritionParsed | null
): ExtractedFeatures => {
  const normalized = ingredients.map((item) => item.toLowerCase())
  const matches = normalized.map((item) => findGlossaryMatch(item))
  const ultraProcessedCount = matches.filter((item) => item?.tags.includes("ultra_processed"))
    .length
  const hasArtificialDye = matches.some((item) => item?.tags.includes("dye")) ? 1 : 0
  const hasHydrogenated = matches.some((item) => item?.tags.includes("trans_fat")) ? 1 : 0
  const hasUncertain = matches.some((item) => item?.tags.includes("uncertain_source")) ? 1 : 0
  const hasAnimalDerived = matches.some((item) => item?.tags.includes("animal_derived")) ? 1 : 0

  return {
    ingredient_count: ingredients.length,
    ultra_processed_additive_count: ultraProcessedCount,
    has_artificial_dye: hasArtificialDye,
    has_hydrogenated_oil: hasHydrogenated,
    sugar_g: nutrition?.sugar_g ?? 0,
    addedSugar_g: nutrition?.addedSugar_g ?? 0,
    sodium_mg: nutrition?.sodium_mg ?? 0,
    fiber_g: nutrition?.fiber_g ?? 0,
    protein_g: nutrition?.protein_g ?? 0,
    calories: nutrition?.calories ?? 0,
    has_uncertain_ingredients: hasUncertain,
    has_animal_derived: hasAnimalDerived
  }
}

export function scoreFromParsed(
  ingredients: string[],
  nutrition: NutritionParsed | null
): ScoreResult {
  const features = extractFeatures(ingredients, nutrition)
  let raw = model.bias
  const contributions: ScoreExplanation[] = []
  const normalizedIngredients = ingredients.map((item) => item.toLowerCase())

  Object.entries(model.weights).forEach(([feature, weight]) => {
    const value = (features as Record<string, number>)[feature] ?? 0
    if (!value) return
    const points = weight * value
    raw += points
    contributions.push({
      label: featureLabels[feature] || feature,
      direction: points >= 0 ? "up" : "down",
      points: Math.round(points * 100),
      reason: featureReasons[feature] || "Model contribution."
    })
  })

  // Whole-fruit guardrail:
  // Vision nutrition estimates for single fruits can look "high sugar" despite being minimally processed.
  // Give a bounded uplift when signals strongly match whole fruit.
  const fruitTokens = [
    "apple",
    "banana",
    "orange",
    "pear",
    "grape",
    "mango",
    "papaya",
    "pineapple",
    "kiwi",
    "peach",
    "plum",
    "apricot",
    "berry",
    "strawberry",
    "blueberry",
    "blackberry",
    "raspberry"
  ]
  const processedFruitTerms = ["juice", "jam", "jelly", "syrup", "honey", "nectar", "preserve"]
  const mentionsFruit = normalizedIngredients.some((item) =>
    fruitTokens.some((token) => item.includes(token))
  )
  const mentionsProcessedFruit = normalizedIngredients.some((item) =>
    processedFruitTerms.some((term) => item.includes(term))
  )
  const looksWholeFruit =
    mentionsFruit &&
    !mentionsProcessedFruit &&
    features.ingredient_count <= 3 &&
    features.ultra_processed_additive_count === 0 &&
    features.has_artificial_dye === 0 &&
    features.has_hydrogenated_oil === 0 &&
    features.has_uncertain_ingredients === 0 &&
    features.addedSugar_g <= 0.5 &&
    features.sodium_mg <= 60

  if (looksWholeFruit) {
    raw += 0.45
    contributions.push({
      label: "Whole fruit profile",
      direction: "up",
      points: 45,
      reason: "Single-ingredient fruit with no processing additives."
    })
  }

  const value = Math.round(clamp(raw, 0, 1) * 100)
  const category: ScoreCategory =
    value >= 70 ? "Good" : value >= 40 ? "Moderate" : "Lower"

  const positives = contributions
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
  const negatives = contributions
    .filter((item) => item.points < 0)
    .sort((a, b) => a.points - b.points)
    .slice(0, 5)

  return {
    value,
    category,
    modelVersion: "ai_v1",
    explanations: [...positives, ...negatives]
  }
}
