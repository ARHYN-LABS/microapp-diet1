import type { NutritionParsed, UserPrefs } from "./index"
import { findGlossaryMatch } from "./glossary"
import type { HalalResult } from "./halal"

export type FlagStatus = "pass" | "warn" | "fail" | "unknown"

export type FlagResult = {
  flag: string
  status: FlagStatus
  confidence: number
  explanation: string
}

const hasTag = (ingredients: string[], tag: string) =>
  ingredients.some((ingredient) => findGlossaryMatch(ingredient)?.tags.includes(tag))

const hasAnimalDerived = (ingredients: string[]) =>
  ingredients.some((ingredient) =>
    findGlossaryMatch(ingredient)?.tags.includes("animal_derived")
  )

const hasDairy = (ingredients: string[]) =>
  ingredients.some((ingredient) => findGlossaryMatch(ingredient)?.tags.includes("dairy"))

const confidenceFromValue = (value: number | null | undefined) =>
  value === null || value === undefined ? 0.3 : 0.8

export function evaluateFlags(
  ingredients: string[],
  nutrition: NutritionParsed | null,
  prefs?: UserPrefs,
  halal?: HalalResult
): FlagResult[] {
  const flags: FlagResult[] = []
  const nutritionData = nutrition || {}

  if (prefs?.halalCheckEnabled) {
    const halalStatus = halal?.status || "unknown"
    flags.push({
      flag: "Halal check",
      status:
        halalStatus === "halal"
          ? "pass"
          : halalStatus === "haram"
            ? "fail"
            : halalStatus === "unclear"
              ? "warn"
              : "unknown",
      confidence: halal?.confidence ?? 0.4,
      explanation: halal?.explanation || "No halal indicators detected."
    })
  }

  const sodium = nutritionData.sodium_mg ?? null
  const sodiumLimit = prefs?.lowSodiumMgLimit ?? null
  flags.push({
    flag: "Low sodium",
    status:
      sodiumLimit === null
        ? "unknown"
        : sodium === null
          ? "unknown"
          : sodium <= sodiumLimit
            ? "pass"
            : sodium <= sodiumLimit * 1.25
              ? "warn"
              : "fail",
    confidence: confidenceFromValue(sodium),
    explanation:
      sodiumLimit === null
        ? "No sodium limit set."
        : sodium === null
          ? "Sodium value was not detected."
          : `Sodium is ${sodium}mg vs your ${sodiumLimit}mg limit.`
  })

  const sugar = nutritionData.sugar_g ?? null
  const sugarLimit = prefs?.lowSugarGlimit ?? null
  flags.push({
    flag: "Low sugar",
    status:
      sugarLimit === null
        ? "unknown"
        : sugar === null
          ? "unknown"
          : sugar <= sugarLimit
            ? "pass"
            : sugar <= sugarLimit * 1.25
              ? "warn"
              : "fail",
    confidence: confidenceFromValue(sugar),
    explanation:
      sugarLimit === null
        ? "No sugar limit set."
        : sugar === null
          ? "Sugar value was not detected."
          : `Sugar is ${sugar}g vs your ${sugarLimit}g limit.`
  })

  const carbs = nutritionData.carbs_g ?? null
  const carbLimit = prefs?.lowCarbGlimit ?? null
  flags.push({
    flag: "Low carb",
    status:
      carbLimit === null
        ? "unknown"
        : carbs === null
          ? "unknown"
          : carbs <= carbLimit
            ? "pass"
            : carbs <= carbLimit * 1.25
              ? "warn"
              : "fail",
    confidence: confidenceFromValue(carbs),
    explanation:
      carbLimit === null
        ? "No carb limit set."
        : carbs === null
          ? "Carb value was not detected."
          : `Carbs are ${carbs}g vs your ${carbLimit}g limit.`
  })

  const calories = nutritionData.calories ?? null
  const calorieLimit = prefs?.lowCalorieLimit ?? null
  flags.push({
    flag: "Low calorie",
    status:
      calorieLimit === null
        ? "unknown"
        : calories === null
          ? "unknown"
          : calories <= calorieLimit
            ? "pass"
            : calories <= calorieLimit * 1.25
              ? "warn"
              : "fail",
    confidence: confidenceFromValue(calories),
    explanation:
      calorieLimit === null
        ? "No calorie limit set."
        : calories === null
          ? "Calories were not detected."
          : `Calories are ${calories} vs your ${calorieLimit} limit.`
  })

  const protein = nutritionData.protein_g ?? null
  const proteinTarget = prefs?.highProteinGtarget ?? null
  flags.push({
    flag: "High protein",
    status:
      proteinTarget === null
        ? "unknown"
        : protein === null
          ? "unknown"
          : protein >= proteinTarget
            ? "pass"
            : protein >= proteinTarget * 0.75
              ? "warn"
              : "fail",
    confidence: confidenceFromValue(protein),
    explanation:
      proteinTarget === null
        ? "No protein target set."
        : protein === null
          ? "Protein value was not detected."
          : `Protein is ${protein}g vs your ${proteinTarget}g target.`
  })

  if (prefs?.vegetarian || prefs?.vegan) {
    const vegetarianIssue = hasAnimalDerived(ingredients)
    const dairyIssue = hasDairy(ingredients)
    flags.push({
      flag: prefs.vegan ? "Vegan" : "Vegetarian",
      status: vegetarianIssue || (prefs.vegan && dairyIssue) ? "fail" : "pass",
      confidence: 0.7,
      explanation: vegetarianIssue
        ? "Contains animal-derived ingredients."
        : prefs.vegan && dairyIssue
          ? "Contains dairy ingredients."
          : "No animal-derived ingredients detected."
    })
  }

  if (prefs?.sensitiveStomach) {
    const hasTrigger = hasTag(ingredients, "sensitive_stomach_trigger")
    flags.push({
      flag: "Sensitive stomach",
      status: hasTrigger ? "warn" : "pass",
      confidence: 0.6,
      explanation: hasTrigger
        ? "Contains acids or additives that can bother sensitive stomachs."
        : "No common sensitive-stomach triggers detected."
    })
  }

  return flags
}
