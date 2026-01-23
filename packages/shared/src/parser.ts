import type { NutritionParsed, ParsedData } from "./index"

const normalize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim()

const stripTrailingPunctuation = (value: string) => value.replace(/[.]+$/g, "")

export function parseIngredients(text: string): ParsedData["ingredients"] {
  if (!text) return []

  const match = text.match(/ingredients?\s*[:\-]\s*/i)
  let section = ""

  if (match?.index !== undefined) {
    section = text.slice(match.index + match[0].length)
  } else {
    const lineMatch = text.match(/ingredients?.*/i)
    section = lineMatch ? lineMatch[0] : text
  }

  const stopTokens = ["nutrition facts", "contains", "allergens"]
  for (const token of stopTokens) {
    const idx = section.toLowerCase().indexOf(token)
    if (idx !== -1) {
      section = section.slice(0, idx)
    }
  }

  const cleaned = normalize(section.replace(/[()]/g, ","))
  if (!cleaned) return []

  return cleaned
    .split(/[,;]+/)
    .map((item) => stripTrailingPunctuation(item.trim()))
    .filter(Boolean)
}

export function parseNutrition(text: string): NutritionParsed | null {
  if (!text) return null

  const caloriesMatch = text.match(/calories?\s*[:\-]?\s*(\d{1,4})/i)
  const servingMatch = text.match(/serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
  const caloriesPer100Match = text.match(/calories\s*per\s*100\s*g\s*[:\-]?\s*(\d{1,4})/i)
  const proteinMatch = text.match(/protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
  const carbsMatch = text.match(/(total\s*)?carb(?:ohydrate)?s?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
  const sugarMatch = text.match(/sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
  const addedSugarMatch = text.match(/added\s*sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
  const sodiumMgMatch = text.match(/sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i)
  const sodiumGMatch = !sodiumMgMatch
    ? text.match(/sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)
    : null
  const fiberMatch = text.match(/fiber\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i)

  const nutrition: NutritionParsed = {
    calories: caloriesMatch ? Number(caloriesMatch[1]) : null,
    servingSizeG: servingMatch ? Number(servingMatch[1]) : null,
    caloriesPer100g: caloriesPer100Match ? Number(caloriesPer100Match[1]) : null,
    protein_g: proteinMatch ? Number(proteinMatch[1]) : null,
    carbs_g: carbsMatch ? Number(carbsMatch[2]) : null,
    sugar_g: sugarMatch ? Number(sugarMatch[1]) : null,
    addedSugar_g: addedSugarMatch ? Number(addedSugarMatch[1]) : null,
    sodium_mg: sodiumMgMatch
      ? Number(sodiumMgMatch[1])
      : sodiumGMatch
        ? Number(sodiumGMatch[1]) * 1000
        : null,
    fiber_g: fiberMatch ? Number(fiberMatch[1]) : null
  }

  const hasAny = Object.values(nutrition).some((value) => value !== null)
  return hasAny ? nutrition : null
}

export function parseProductName(frontText?: string): string | null {
  if (!frontText) return null
  const lines = frontText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const filtered = lines.filter((line) => {
    const lower = line.toLowerCase()
    return !lower.includes("nutrition") && !lower.includes("ingredients")
  })

  return filtered.length ? filtered[0] : lines[0] || null
}

export function parseExtraction(
  ingredientsText: string,
  nutritionText: string,
  frontText?: string
): ParsedData {
  const ingredients = parseIngredients(ingredientsText)
  const nutrition = parseNutrition(nutritionText)
  const productName = parseProductName(frontText)

  const ingredientsConfidence = ingredients.length
    ? ingredientsText.toLowerCase().includes("ingredient")
      ? 0.85
      : 0.6
    : 0.2
  const foundNutritionCount = nutrition
    ? Object.values(nutrition).filter((value) => value !== null).length
    : 0
  const nutritionConfidence = Math.min(1, foundNutritionCount / 7)
  const nameConfidence = productName
    ? frontText && frontText.split(/\r?\n/).length > 1
      ? 0.6
      : 0.4
    : 0.1

  return {
    productName,
    ingredients,
    nutrition,
    confidences: {
      ingredientsConfidence,
      nutritionConfidence,
      nameConfidence
    }
  }
}

export function calculateCaloriesPer50g(nutrition: NutritionParsed | null): number | null {
  if (!nutrition) return null
  if (nutrition.caloriesPer100g !== null && nutrition.caloriesPer100g !== undefined) {
    return Number((nutrition.caloriesPer100g * 0.5).toFixed(1))
  }
  if (
    nutrition.calories !== null &&
    nutrition.calories !== undefined &&
    nutrition.servingSizeG !== null &&
    nutrition.servingSizeG !== undefined &&
    nutrition.servingSizeG > 0
  ) {
    return Number(((nutrition.calories * 50) / nutrition.servingSizeG).toFixed(1))
  }
  return null
}
