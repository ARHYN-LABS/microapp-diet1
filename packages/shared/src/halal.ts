import { findGlossaryMatch } from "./glossary"

export type HalalStatus = "halal" | "haram" | "unclear" | "unknown"

export type HalalResult = {
  status: HalalStatus
  confidence: number
  explanation: string
}

const explicitHaramTerms = ["pork", "bacon", "lard", "ham", "alcohol"]
const ambiguousTerms = ["gelatin", "carmine", "rennet", "natural flavors", "enzymes", "spices"]

export function classifyHalal(ingredients: string[], extractedText?: string): HalalResult {
  const normalized = ingredients.map((item) => item.toLowerCase())
  const combined = (extractedText || "").toLowerCase()

  if (combined.includes("halal")) {
    return {
      status: "halal",
      confidence: 0.65,
      explanation: "Halal text detected, but certification is not verified."
    }
  }

  if (normalized.some((item) => explicitHaramTerms.some((term) => item.includes(term)))) {
    return {
      status: "haram",
      confidence: 0.85,
      explanation: "Contains ingredients commonly derived from non-halal sources."
    }
  }

  if (normalized.some((item) => ambiguousTerms.some((term) => item.includes(term)))) {
    return {
      status: "unclear",
      confidence: 0.6,
      explanation: "Contains ingredients with unclear halal sourcing."
    }
  }

  const matches = normalized.map((item) => findGlossaryMatch(item)).filter(Boolean)
  if (matches.some((item) => item?.halalRisk === "haram_known")) {
    return {
      status: "haram",
      confidence: 0.85,
      explanation: "Contains ingredients known to be non-halal."
    }
  }

  if (matches.some((item) => item?.halalRisk === "animal")) {
    return {
      status: "unclear",
      confidence: 0.55,
      explanation: "Contains animal-derived ingredients without certification."
    }
  }

  if (matches.some((item) => item?.halalRisk === "unknown")) {
    return {
      status: "unclear",
      confidence: 0.45,
      explanation: "Some ingredients have unclear sourcing."
    }
  }

  return {
    status: "unknown",
    confidence: 0.3,
    explanation: "No clear halal indicators detected."
  }
}
