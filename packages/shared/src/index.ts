import type { AnalyzeFromImagesResponse } from "./analyze"

export type NutritionParsed = {
  calories?: number | null
  servingSizeG?: number | null
  caloriesPer100g?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  sugar_g?: number | null
  addedSugar_g?: number | null
  sodium_mg?: number | null
  fiber_g?: number | null
}

export type OCRExtraction = {
  ingredientsText: string
  nutritionText: string
  frontText?: string
}

export type ParsedData = {
  productName: string | null
  ingredients: string[]
  nutrition: NutritionParsed | null
  confidences: {
    ingredientsConfidence: number
    nutritionConfidence: number
    nameConfidence: number
  }
}

export type UserPrefs = {
  userId: string
  halalCheckEnabled: boolean
  lowSodiumMgLimit?: number | null
  lowSugarGlimit?: number | null
  lowCarbGlimit?: number | null
  lowCalorieLimit?: number | null
  highProteinGtarget?: number | null
  vegetarian?: boolean | null
  vegan?: boolean | null
  sensitiveStomach?: boolean | null
}

export type ScanHistory = {
  id: string
  userId: string
  createdAt: string
  productName?: string | null
  extractedText?: OCRExtraction | null
  parsedIngredients?: string[] | null
  parsedNutrition?: NutritionParsed | null
  analysisSnapshot?: AnalyzeFromImagesResponse | null
}

export * from "./api"
export * from "./glossary"
export * from "./scoring"
export * from "./flags"
export * from "./analyze"
export * from "./parser"
export * from "./halal"
