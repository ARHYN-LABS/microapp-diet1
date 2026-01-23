import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native"
import Svg, { Circle } from "react-native-svg"
import type { AnalyzeFromImagesResponse } from "@wimf/shared"
import { theme } from "../theme"
import { getUserPrefs } from "../storage/cache"
import type { UserPrefs } from "@wimf/shared"

type ResultsParams = {
  analysis: AnalyzeFromImagesResponse
}

type Props = {
  route: { params: ResultsParams }
}

const categoryColors: Record<string, string> = {
  Good: theme.colors.accent,
  Moderate: theme.colors.warning,
  Lower: theme.colors.danger
}

type RingProps = {
  label: string
  value: number | null | undefined
  target: number | null | undefined
  unit: string
  color: string
}

const RingCard = ({ label, value, target, unit, color }: RingProps) => {
  const size = 88
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const hasData = value !== null && value !== undefined && target !== null && target !== undefined
  const progress = hasData && target > 0 ? Math.min(1, value / target) : 0
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <View style={styles.ringCard}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text style={styles.ringValue}>{hasData ? Math.round(progress * 100) : "--"}%</Text>
      <Text style={styles.ringLabel}>{label}</Text>
      <Text style={styles.ringMeta}>
        {hasData ? `${value}${unit} of ${target}${unit}` : "Not detected"}
      </Text>
    </View>
  )
}

export default function ResultsScreen({ route }: Props) {
  const { analysis } = route.params
  const [expanded, setExpanded] = useState(false)
  const [activeFlag, setActiveFlag] =
    useState<AnalyzeFromImagesResponse["personalizedFlags"][number] | null>(null)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const scoreColor = useMemo(
    () => categoryColors[analysis.score.category] || theme.colors.text,
    [analysis.score.category]
  )

  const caloriesPer100g = useMemo(() => {
    const nutrition = analysis.nutritionHighlights
    if (!nutrition) return null
    if (nutrition.caloriesPer100g !== null && nutrition.caloriesPer100g !== undefined) {
      return Number(nutrition.caloriesPer100g.toFixed(1))
    }
    if (
      nutrition.calories !== null &&
      nutrition.calories !== undefined &&
      nutrition.servingSizeG !== null &&
      nutrition.servingSizeG !== undefined &&
      nutrition.servingSizeG > 0
    ) {
      return Number(((nutrition.calories * 100) / nutrition.servingSizeG).toFixed(1))
    }
    return null
  }, [analysis.nutritionHighlights])

  const labelConfidence = useMemo(() => {
    const values = Object.values(analysis.parsing.confidences)
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return average.toFixed(2)
  }, [analysis.parsing.confidences])

  useEffect(() => {
    const loadPrefs = async () => {
      const cached = await getUserPrefs()
      if (cached) setPrefs(cached)
    }

    loadPrefs()
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{analysis.productName || "Unknown product"}</Text>
          <Text style={styles.meta}>Label read confidence: {labelConfidence}</Text>
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>Results</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, styles.metricCardSpacing]}>
          <Text style={styles.metricLabel}>Calories per 100g</Text>
          <Text style={styles.metricValue}>
            {caloriesPer100g === null ? "Unknown" : `${caloriesPer100g}`}
          </Text>
          <Text style={styles.metricMeta}>
            {caloriesPer100g === null ? "Not detected" : "From nutrition label"}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Quality score</Text>
          <Text style={[styles.metricValue, { color: scoreColor }]}>{analysis.score.value}</Text>
          <Text style={[styles.metricMeta, { color: scoreColor }]}>
            {analysis.score.category}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personalized for you</Text>
        <View style={styles.flagRow}>
          {analysis.personalizedFlags.map((flag, index) => (
            <Pressable
              key={flag.flag}
              style={[
                styles.flagChip,
                index < analysis.personalizedFlags.length - 1 ? styles.flagChipSpacing : null
              ]}
              onPress={() => setActiveFlag(flag)}
            >
              <Text style={styles.flagChipText}>{flag.flag}: {flag.status}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.ringRow}>
        <View style={styles.ringCardSpacing}>
          <RingCard
          label="Sodium vs limit"
          value={analysis.nutritionHighlights?.sodium_mg}
          target={prefs?.lowSodiumMgLimit ?? null}
          unit="mg"
          color={theme.colors.accent}
        />
        </View>
        <View style={styles.ringCardSpacing}>
          <RingCard
          label="Sugar vs limit"
          value={analysis.nutritionHighlights?.sugar_g}
          target={prefs?.lowSugarGlimit ?? null}
          unit="g"
          color={theme.colors.warning}
        />
        </View>
        <RingCard
          label="Protein vs target"
          value={analysis.nutritionHighlights?.protein_g}
          target={prefs?.highProteinGtarget ?? null}
          unit="g"
          color={theme.colors.accent2}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Halal status</Text>
        <View style={styles.halalCard}>
          <Text style={styles.halalStatus}>{analysis.halal.status.toUpperCase()}</Text>
          <Text style={styles.halalMeta}>
            Confidence {analysis.halal.confidence.toFixed(2)}
          </Text>
          <Text style={styles.halalMeta}>{analysis.halal.explanation}</Text>
        </View>
      </View>

      <Pressable style={styles.accordion} onPress={() => setExpanded((prev) => !prev)}>
        <Text style={styles.accordionTitle}>Why this score?</Text>
        {expanded ? (
          <View style={styles.accordionBody}>
            {analysis.score.explanations.map((item, index) => (
              <Text style={styles.explanation} key={`${item.label}-${index}`}>
                {item.label}: {item.direction === "up" ? "+" : "-"}
                {item.points} - {item.reason}
              </Text>
            ))}
          </View>
        ) : null}
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients explained</Text>
        {analysis.ingredientBreakdown.map((ingredient, index) => (
          <View style={styles.ingredientRow} key={`${ingredient.name}-${index}`}>
            <Text style={styles.ingredientStatus}>
              {ingredient.status === "good"
                ? "[OK]"
                : ingredient.status === "caution"
                  ? "[WARN]"
                  : "[NEUTRAL]"}
            </Text>
            <View style={styles.ingredientBody}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientMeta}>{ingredient.plainEnglish}</Text>
              <Text style={styles.ingredientMeta}>Why used: {ingredient.whyUsed}</Text>
              <Text style={styles.ingredientMeta}>Who might care: {ingredient.whoMightCare}</Text>
              {ingredient.uncertaintyNote ? (
                <Text style={styles.ingredientMeta}>Uncertainty: {ingredient.uncertaintyNote}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What we detected</Text>
        <Text style={styles.nutritionText}>
          Ingredients: {analysis.parsing.extractedText.ingredientsText || "Not detected"}
        </Text>
        <Text style={styles.nutritionText}>
          Nutrition: {analysis.parsing.extractedText.nutritionText || "Not detected"}
        </Text>
        <Text style={styles.nutritionText}>
          Front: {analysis.parsing.extractedText.frontText || "Not provided"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition highlights</Text>
        <Text style={styles.nutritionText}>
          Calories: {analysis.nutritionHighlights?.calories ?? "Unknown"} | Protein:{" "}
          {analysis.nutritionHighlights?.protein_g ?? "Unknown"}g | Carbs:{" "}
          {analysis.nutritionHighlights?.carbs_g ?? "Unknown"}g | Sugar:{" "}
          {analysis.nutritionHighlights?.sugar_g ?? "Unknown"}g | Sodium:{" "}
          {analysis.nutritionHighlights?.sodium_mg ?? "Unknown"}mg
        </Text>
      </View>

      {activeFlag && (
        <Pressable style={styles.overlay} onPress={() => setActiveFlag(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeFlag.flag}</Text>
            <Text style={styles.modalText}>{activeFlag.explanation}</Text>
            <Text style={styles.modalText}>
              Status: {activeFlag.status} | Confidence {activeFlag.confidence.toFixed(2)}
            </Text>
          </View>
        </Pressable>
      )}

      <Text style={styles.disclaimer}>{analysis.disclaimer}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.bg
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 4
  },
  scoreChip: {
    backgroundColor: theme.colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  scoreChipText: {
    color: theme.colors.muted,
    fontSize: 12
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: 16,
    minWidth: 160,
    marginBottom: 12
  },
  metricCardSpacing: {
    marginRight: 12
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: "uppercase"
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8
  },
  metricMeta: {
    color: theme.colors.muted,
    marginTop: 6
  },
  accordion: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.panelAlt,
    padding: 14,
    marginBottom: 16
  },
  accordionTitle: {
    fontWeight: "700",
    color: theme.colors.text
  },
  accordionBody: {
    marginTop: 8
  },
  explanation: {
    color: theme.colors.muted,
    marginBottom: 6
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: theme.colors.text
  },
  flagRow: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  flagChip: {
    borderWidth: 1,
    borderColor: theme.colors.panelAlt,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  flagChipSpacing: {
    marginRight: 8
  },
  flagChipText: {
    color: theme.colors.text,
    fontSize: 12
  },
  ringRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16
  },
  ringCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.panel,
    padding: 12,
    borderRadius: theme.radius.lg,
    minWidth: 110,
    marginBottom: 12
  },
  ringCardSpacing: {
    marginRight: 12
  },
  ringValue: {
    color: theme.colors.text,
    fontWeight: "700",
    marginTop: -56,
    fontSize: 14
  },
  ringLabel: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 6
  },
  ringMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 4
  },
  halalCard: {
    backgroundColor: theme.colors.panel,
    padding: 14,
    borderRadius: theme.radius.lg
  },
  halalStatus: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  halalMeta: {
    color: theme.colors.muted,
    marginTop: 4
  },
  ingredientRow: {
    flexDirection: "row",
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.panel,
    marginBottom: 8
  },
  ingredientStatus: {
    fontSize: 12,
    color: theme.colors.muted,
    width: 70
  },
  ingredientBody: {
    flex: 1
  },
  ingredientName: {
    fontWeight: "700",
    color: theme.colors.text
  },
  ingredientMeta: {
    color: theme.colors.muted,
    fontSize: 12
  },
  nutritionText: {
    color: theme.colors.muted,
    marginBottom: 6
  },
  disclaimer: {
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: 8
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center"
  },
  modalCard: {
    width: "85%",
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: 16
  },
  modalTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: 8
  },
  modalText: {
    color: theme.colors.muted,
    marginBottom: 6
  }
})
