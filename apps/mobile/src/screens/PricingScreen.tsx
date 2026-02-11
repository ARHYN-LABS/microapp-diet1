import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { fetchBillingSummary } from "../api/client"
import { theme } from "../theme"

const plans = [
  { key: "free", label: "Free", price: "$0", scans: 10, action: "Current Plan" },
  { key: "silver", label: "Silver", price: "$9.99", scans: 150, action: "Upgrade (Soon)" },
  { key: "golden", label: "Golden", price: "$19.99", scans: 300, action: "Upgrade (Soon)" }
]

export default function PricingScreen() {
  const [loading, setLoading] = useState(true)
  const [planName, setPlanName] = useState("free")
  const [error, setError] = useState<string | null>(null)

  const loadSummary = async () => {
    setLoading(true)
    try {
      const summary = await fetchBillingSummary()
      setPlanName(summary.planName || "free")
      setError(null)
    } catch (err) {
      setError((err as Error).message || "Unable to load billing")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pricing</Text>
      <Text style={styles.subtitle}>Pick a plan that matches your scan needs.</Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accent} style={styles.loading} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.cardGrid}>
        {plans.map((plan) => {
          const isCurrent = plan.key === planName
          return (
            <View key={plan.key} style={[styles.card, isCurrent && styles.cardActive]}>
              <Text style={styles.cardTitle}>{plan.label}</Text>
              <Text style={styles.cardPrice}>{plan.price} / month</Text>
              <Text style={styles.cardScans}>{plan.scans} scans</Text>
              <Pressable disabled style={[styles.button, styles.buttonDisabled]}>
                <Text style={styles.buttonText}>{isCurrent ? "Current Plan" : plan.action}</Text>
              </Pressable>
            </View>
          )
        })}
      </View>

      <Text style={styles.disclaimer}>Checkout is disabled in test mode. Plans are display-only.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.bg
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.muted
  },
  loading: {
    marginTop: theme.spacing.md
  },
  error: {
    marginTop: theme.spacing.md,
    color: theme.colors.warning
  },
  cardGrid: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardActive: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text
  },
  cardPrice: {
    marginTop: 6,
    fontSize: 16,
    color: theme.colors.text
  },
  cardScans: {
    marginTop: 2,
    color: theme.colors.muted
  },
  button: {
    marginTop: theme.spacing.md,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: theme.colors.accent
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border
  },
  buttonText: {
    color: theme.colors.accent2,
    fontWeight: "700"
  },
  disclaimer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.muted,
    textAlign: "center"
  }
})
