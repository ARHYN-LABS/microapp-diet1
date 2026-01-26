import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { getJournalForDate, getGoals, getStreaks, getActivities } from "../storage/tracking"
import { theme } from "../theme"

const todayKey = () => new Date().toISOString().slice(0, 10)

export default function DashboardScreen() {
  const navigation = useNavigation()
  const [date] = useState(todayKey())
  const [totals, setTotals] = useState({
    calories: 0,
    protein_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
    missingNutritionCount: 0
  })
  const [goals, setGoals] = useState({
    caloriesTarget: 2000,
    proteinTarget: 80,
    sodiumLimit: 2000,
    sugarLimit: 50
  })
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 })
  const [activityCalories, setActivityCalories] = useState(0)

  useEffect(() => {
    const load = async () => {
      const log = await getJournalForDate(date)
      const goal = await getGoals()
      const streak = await getStreaks()
      const activity = await getActivities()
      const todayActivity = activity
        .filter((entry) => entry.date === date)
        .reduce((sum, entry) => sum + entry.caloriesBurned, 0)

      setTotals({
        calories: log.totals.calories,
        protein_g: log.totals.protein_g,
        sugar_g: log.totals.sugar_g,
        sodium_mg: log.totals.sodium_mg,
        missingNutritionCount: log.missingNutritionCount
      })
      setGoals(goal)
      setStreaks(streak)
      setActivityCalories(Math.round(todayActivity))
    }

    load()
  }, [date])

  const handleShare = async () => {
    const text = [
      "Today summary (educational only):",
      `Calories: ${totals.calories}/${goals.caloriesTarget}`,
      `Protein: ${totals.protein_g}g`,
      `Sugar: ${totals.sugar_g}g`,
      `Sodium: ${totals.sodium_mg}mg`,
      "Educational, not medical advice."
    ].join("\n")

    await Share.share({ message: text })
  }

  const percent = (value: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.subtitle}>Track your day in seconds.</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakValue}>{streaks.current}d</Text>
        </View>
      </View>

      <View style={[styles.glassCard, styles.heroCard]}>
        <Text style={styles.cardLabel}>Calories</Text>
        <Text style={styles.heroValue}>{totals.calories}</Text>
        <Text style={styles.heroMeta}>
          of {goals.caloriesTarget} kcal target
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percent(totals.calories, goals.caloriesTarget)}%` }
            ]}
          />
        </View>
        <Text style={styles.cardMeta}>
          {totals.calories >= goals.caloriesTarget ? "Limit reached" : "Within your limit"}
        </Text>
      </View>

      <View style={styles.cardGrid}>
        <View style={styles.glassTile}>
          <Text style={styles.cardLabel}>Protein</Text>
          <Text style={styles.tileValue}>
            {totals.protein_g}g / {goals.proteinTarget}g
          </Text>
        </View>
        <View style={styles.glassTile}>
          <Text style={styles.cardLabel}>Sodium</Text>
          <Text style={styles.tileValue}>
            {totals.sodium_mg}mg / {goals.sodiumLimit}mg
          </Text>
        </View>
        <View style={styles.glassTile}>
          <Text style={styles.cardLabel}>Sugar</Text>
          <Text style={styles.tileValue}>
            {totals.sugar_g}g / {goals.sugarLimit}g
          </Text>
        </View>
        <View style={styles.glassTile}>
          <Text style={styles.cardLabel}>Activity</Text>
          <Text style={styles.tileValue}>{activityCalories} kcal</Text>
        </View>
      </View>

      {totals.missingNutritionCount > 0 && (
        <Text style={styles.notice}>
          Some items are missing nutrition. Totals may be incomplete.
        </Text>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Journal" as never)}>
          <Text style={styles.primaryButtonText}>Log a meal</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleShare}>
          <Text style={styles.secondaryButtonText}>Share today</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>Educational, not medical advice.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.bg
  },
  glowTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(87, 182, 255, 0.18)"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.font.heading
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 4
  },
  streakPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  streakLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  streakValue: {
    color: theme.colors.text,
    fontWeight: "700",
    marginTop: 2
  },
  cardLabel: {
    color: theme.colors.muted,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1.1
  },
  heroCard: {
    marginBottom: theme.spacing.md
  },
  heroValue: {
    fontSize: 42,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 8,
    fontFamily: theme.font.heading
  },
  heroMeta: {
    color: theme.colors.textSoft,
    marginTop: 4
  },
  cardMeta: {
    color: theme.colors.muted,
    marginTop: 8
  },
  glassCard: {
    backgroundColor: theme.colors.glassStrong,
    borderRadius: theme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginTop: 14,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.accent
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: theme.spacing.md
  },
  glassTile: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  tileValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6
  },
  notice: {
    color: theme.colors.warning,
    marginBottom: theme.spacing.md
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.md
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.accent2,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#051018",
    fontWeight: "700"
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  disclaimer: {
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: 8
  }
})
