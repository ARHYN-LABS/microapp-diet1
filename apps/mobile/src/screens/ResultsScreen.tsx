import { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Circle } from "react-native-svg"
import type { AnalyzeFromImagesResponse, UserPrefs } from "@wimf/shared"
import { theme } from "../theme"
import { getUserPrefs } from "../storage/cache"
import { addJournalItem } from "../storage/tracking"

type ResultsParams = {
  analysis: AnalyzeFromImagesResponse
}

type Props = {
  route: { params: ResultsParams }
}

const categoryColors: Record<string, string> = {
  Good: theme.colors.success,
  Moderate: theme.colors.warning,
  Lower: theme.colors.danger
}

const spacing = theme.spacing

const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View style={[styles.card, style]}>{children}</View>
)

const SectionHeader = ({ title, icon }: { title: string; icon?: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionHeader}>{title}</Text>
    {icon ? <Ionicons name={icon} size={16} color={theme.colors.muted} /> : null}
  </View>
)

const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) => (
  <Pressable
    style={[styles.chip, active ? styles.chipActive : null]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
  </Pressable>
)

const MetricCard = ({
  label,
  value,
  helper,
  accent,
  icon
}: {
  label: string
  value: string | number
  helper: string
  accent?: string
  icon?: keyof typeof Ionicons.glyphMap
}) => (
  <Card style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <Text style={styles.metricLabel}>{label}</Text>
      {icon ? <Ionicons name={icon} size={18} color={accent || theme.colors.muted} /> : null}
    </View>
    <Text style={[styles.metricValue, accent ? { color: accent } : null]}>{value}</Text>
    <Text style={styles.metricHelper}>{helper}</Text>
  </Card>
)

const GaugeCard = ({
  label,
  value,
  target,
  unit,
  color
}: {
  label: string
  value: number | null | undefined
  target: number | null | undefined
  unit: string
  color: string
}) => {
  const size = 88
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const hasData = value !== null && value !== undefined && target !== null && target !== undefined
  const progress = hasData && target > 0 ? Math.min(1, value / target) : 0
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <Card style={styles.gaugeCard}>
      <Svg width={size} height={size} style={styles.gaugeRing}>
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
      <Text style={styles.gaugePercent}>{hasData ? Math.round(progress * 100) : "--"}%</Text>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <Text style={styles.gaugeMeta}>
        {hasData ? `${value}${unit} of ${target}${unit}` : "Not detected"}
      </Text>
    </Card>
  )
}

const IngredientItem = ({
  status,
  name,
  description,
  whyUsed,
  whoMightCare,
  uncertaintyNote
}: {
  status: string
  name: string
  description: string
  whyUsed: string
  whoMightCare: string
  uncertaintyNote?: string
}) => (
  <Card style={styles.ingredientCard}>
    <View style={styles.ingredientHeader}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>
      <Text style={styles.ingredientName}>{name}</Text>
    </View>
    <Text style={styles.bodyText}>{description}</Text>
    <Text style={styles.bodyText}>Why used: {whyUsed}</Text>
    <Text style={styles.bodyText}>Who might care: {whoMightCare}</Text>
    {uncertaintyNote ? <Text style={styles.bodyMuted}>Uncertainty: {uncertaintyNote}</Text> : null}
  </Card>
)

export default function ResultsScreen({ route }: Props) {
  const { analysis } = route.params
  const insets = useSafeAreaInsets()
  const [expanded, setExpanded] = useState(false)
  const [activeFlag, setActiveFlag] =
    useState<AnalyzeFromImagesResponse["personalizedFlags"][number] | null>(null)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [status, setStatus] = useState("")
  const [mealType, setMealType] =
    useState<"breakfast" | "lunch" | "dinner" | "snack">("snack")
  const [grams, setGrams] = useState("50")
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
    if (!values.length) return "0.00"
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return average.toFixed(2)
  }, [analysis.parsing.confidences])

  const handleEat = async () => {
    if (caloriesPer100g === null) {
      setStatus("Calories unknown. Try another image.")
      return
    }
    setStatus("Adding to daily intake...")
    try {
      await addJournalItem({
        id: `${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        mealType,
        grams: Number(grams) || 50,
        createdAt: new Date().toISOString(),
        analysisSnapshot: analysis,
        name: analysis.productName || "Scan item",
        nutritionPer100g: {
          id: "scan",
          name: analysis.productName || "Scan item",
          caloriesPer100g,
          protein_g: analysis.nutritionHighlights?.protein_g ?? null,
          carbs_g: analysis.nutritionHighlights?.carbs_g ?? null,
          sugar_g: analysis.nutritionHighlights?.sugar_g ?? null,
          sodium_mg: analysis.nutritionHighlights?.sodium_mg ?? null
        }
      })
      setStatus("Added to journal.")
    } catch (error) {
      setStatus((error as Error).message)
    }
  }

  const handleAddToJournal = async () => {
    if (caloriesPer100g === null) {
      setStatus("Calories unknown. Try another image.")
      return
    }
    await addJournalItem({
      id: `${Date.now()}-${mealType}`,
      date: new Date().toISOString().slice(0, 10),
      mealType,
      grams: Number(grams) || 50,
      createdAt: new Date().toISOString(),
      analysisSnapshot: analysis,
      name: analysis.productName || "Scan item",
      nutritionPer100g: {
        id: "scan",
        name: analysis.productName || "Scan item",
        caloriesPer100g,
        protein_g: analysis.nutritionHighlights?.protein_g ?? null,
        carbs_g: analysis.nutritionHighlights?.carbs_g ?? null,
        sugar_g: analysis.nutritionHighlights?.sugar_g ?? null,
        sodium_mg: analysis.nutritionHighlights?.sodium_mg ?? null
      }
    })
    setStatus("Added to journal.")
  }

  useEffect(() => {
    const loadPrefs = async () => {
      const cached = await getUserPrefs()
      if (cached) setPrefs(cached)
    }

    loadPrefs()
  }, [])

  const suitabilityLabel =
    analysis.suitability?.verdict === "good"
      ? "Suitable"
      : analysis.suitability?.verdict === "not_recommended"
        ? "Not recommended"
        : "Unknown"

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: insets.bottom + 88
        }
      ]}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{analysis.productName || "Unknown product"}</Text>
        <Text style={styles.subtitle}>Label read confidence: {labelConfidence}</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Calories per 100g"
          value={caloriesPer100g === null ? "Unknown" : caloriesPer100g}
          helper={caloriesPer100g === null ? "Not detected" : "From nutrition label"}
          icon="flame-outline"
        />
        <MetricCard
          label="Quality score"
          value={analysis.score.value}
          helper={analysis.score.category}
          accent={scoreColor}
          icon="pulse-outline"
        />
        <MetricCard
          label="Suitability"
          value={suitabilityLabel}
          helper={analysis.suitability?.reasons?.length ? analysis.suitability.reasons.join(" ") : "No additional notes."}
          icon="checkmark-circle-outline"
        />
      </View>

      <Card style={styles.ctaCard}>
        <Pressable style={styles.primaryButton} onPress={handleEat}>
          <Ionicons name="restaurant-outline" size={18} color="#02130c" />
          <Text style={styles.primaryButtonText}>I am eating this</Text>
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
            <Chip
              key={meal}
              label={meal}
              active={mealType === meal}
              onPress={() => setMealType(meal)}
            />
          ))}
        </ScrollView>
        <Text style={styles.inputLabel}>Grams</Text>
        <TextInput
          style={styles.input}
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          placeholder="50"
          placeholderTextColor={theme.colors.muted}
        />
        <Pressable style={styles.secondaryButton} onPress={handleAddToJournal}>
          <Text style={styles.secondaryButtonText}>Add to Journal</Text>
        </Pressable>
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
      </Card>

      <SectionHeader title="Personalized for you" icon="sparkles-outline" />
      <View style={styles.flagsWrap}>
        {analysis.personalizedFlags.length ? (
          analysis.personalizedFlags.map((flag) => (
            <Pressable
              key={flag.flag}
              style={styles.flagChip}
              onPress={() => setActiveFlag(flag)}
            >
              <Text style={styles.flagText}>{flag.flag}: {flag.status}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.bodyMuted}>No personalized flags yet.</Text>
        )}
      </View>

      <View style={styles.gaugeGrid}>
        <GaugeCard
          label="Sodium vs limit"
          value={analysis.nutritionHighlights?.sodium_mg}
          target={prefs?.lowSodiumMgLimit ?? null}
          unit="mg"
          color={theme.colors.accent}
        />
        <GaugeCard
          label="Sugar vs limit"
          value={analysis.nutritionHighlights?.sugar_g}
          target={prefs?.lowSugarGlimit ?? null}
          unit="g"
          color={theme.colors.warning}
        />
        <GaugeCard
          label="Protein vs target"
          value={analysis.nutritionHighlights?.protein_g}
          target={prefs?.highProteinGtarget ?? null}
          unit="g"
          color={theme.colors.accent2}
        />
      </View>

      <SectionHeader title="Halal status" icon="information-circle-outline" />
      <Card>
        <Text style={styles.halalStatus}>{analysis.halal.status.toUpperCase()}</Text>
        <Text style={styles.bodyMuted}>Confidence {analysis.halal.confidence.toFixed(2)}</Text>
        <Text style={styles.bodyText}>{analysis.halal.explanation}</Text>
      </Card>

      <Pressable style={styles.accordion} onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.accordionHeader}>
          <Text style={styles.sectionHeader}>Why this score?</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.muted} />
        </View>
        {expanded ? (
          <View style={styles.accordionBody}>
            {analysis.score.explanations.map((item, index) => (
              <Text style={styles.bodyText} key={`${item.label}-${index}`}>
                {item.label}: {item.direction === "up" ? "+" : "-"}{item.points} - {item.reason}
              </Text>
            ))}
          </View>
        ) : null}
      </Pressable>

      <SectionHeader title="Ingredients explained" icon="leaf-outline" />
      {analysis.ingredientBreakdown.map((ingredient, index) => (
        <IngredientItem
          key={`${ingredient.name}-${index}`}
          status={
            ingredient.status === "good"
              ? "OK"
              : ingredient.status === "caution"
                ? "WARN"
                : "NEUTRAL"
          }
          name={ingredient.name}
          description={ingredient.plainEnglish}
          whyUsed={ingredient.whyUsed}
          whoMightCare={ingredient.whoMightCare}
          uncertaintyNote={ingredient.uncertaintyNote}
        />
      ))}

      <Card>
        <SectionHeader title="What we detected" icon="document-text-outline" />
        <Text style={styles.bodyMuted}>
          Ingredients: {analysis.parsing.extractedText.ingredientsText || "Not detected"}
        </Text>
        <Text style={styles.bodyMuted}>
          Nutrition: {analysis.parsing.extractedText.nutritionText || "Not detected"}
        </Text>
        <Text style={styles.bodyMuted}>
          Front: {analysis.parsing.extractedText.frontText || "Not provided"}
        </Text>

        <View style={styles.divider} />

        <SectionHeader title="Nutrition highlights" icon="fitness-outline" />
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionChip}><Text style={styles.nutritionText}>Calories {analysis.nutritionHighlights?.calories ?? "Unknown"}</Text></View>
          <View style={styles.nutritionChip}><Text style={styles.nutritionText}>Protein {analysis.nutritionHighlights?.protein_g ?? "Unknown"}g</Text></View>
          <View style={styles.nutritionChip}><Text style={styles.nutritionText}>Carbs {analysis.nutritionHighlights?.carbs_g ?? "Unknown"}g</Text></View>
          <View style={styles.nutritionChip}><Text style={styles.nutritionText}>Sugar {analysis.nutritionHighlights?.sugar_g ?? "Unknown"}g</Text></View>
          <View style={styles.nutritionChip}><Text style={styles.nutritionText}>Sodium {analysis.nutritionHighlights?.sodium_mg ?? "Unknown"}mg</Text></View>
        </View>
      </Card>

      {activeFlag && (
        <Pressable style={styles.overlay} onPress={() => setActiveFlag(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{activeFlag.flag}</Text>
            <Text style={styles.bodyText}>{activeFlag.explanation}</Text>
            <Text style={styles.bodyMuted}>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: theme.colors.bg
  },
  headerBlock: {
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.font.heading,
    lineHeight: 36
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: spacing.sm,
    fontSize: 14
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: theme.font.heading
  },
  card: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: spacing.md
  },
  metricsGrid: {
    gap: spacing.md
  },
  metricCard: {
    gap: spacing.sm
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.colors.muted
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.font.heading
  },
  metricHelper: {
    fontSize: 13,
    color: theme.colors.textSoft
  },
  ctaCard: {
    padding: spacing.md,
    gap: spacing.sm
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  primaryButtonText: {
    color: "#02130c",
    fontWeight: "700",
    fontSize: 16
  },
  chipRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass
  },
  chipActive: {
    borderColor: theme.colors.accent2,
    backgroundColor: "rgba(87, 182, 255, 0.14)"
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.text
  },
  chipTextActive: {
    color: theme.colors.text
  },
  inputLabel: {
    color: theme.colors.muted,
    fontSize: 13
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: Platform.select({ ios: 12, android: 10 }),
    color: theme.colors.text,
    backgroundColor: theme.colors.glassStrong
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  statusText: {
    color: theme.colors.muted,
    fontSize: 12
  },
  flagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  flagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass
  },
  flagText: {
    color: theme.colors.text,
    fontSize: 12
  },
  gaugeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md
  },
  gaugeCard: {
    width: "48%",
    alignItems: "center"
  },
  gaugeRing: {
    marginBottom: spacing.sm
  },
  gaugePercent: {
    position: "absolute",
    top: 40,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text
  },
  gaugeLabel: {
    color: theme.colors.text,
    fontSize: 12
  },
  gaugeMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    textAlign: "center"
  },
  halalStatus: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: spacing.sm
  },
  accordion: {
    marginTop: spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: spacing.md,
    backgroundColor: theme.colors.glass
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  accordionBody: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  ingredientCard: {
    padding: spacing.md
  },
  ingredientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  badge: {
    backgroundColor: theme.colors.panelAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  badgeText: {
    color: theme.colors.textSoft,
    fontSize: 11
  },
  ingredientName: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 15
  },
  bodyText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18
  },
  bodyMuted: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: spacing.sm
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: spacing.md
  },
  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  nutritionChip: {
    backgroundColor: theme.colors.panelAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  nutritionText: {
    color: theme.colors.textSoft,
    fontSize: 12
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
    backgroundColor: theme.colors.glassStrong,
    borderRadius: theme.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  disclaimer: {
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: spacing.lg
  }
})
