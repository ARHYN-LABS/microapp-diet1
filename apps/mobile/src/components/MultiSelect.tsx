import { useMemo, useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../theme"

type Option = {
  value: string
  label: string
  description?: string
}

type Props = {
  label: string
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export default function MultiSelect({ label, options, selected, onChange, placeholder }: Props) {
  const [query, setQuery] = useState("")
  const [custom, setCustom] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const lowered = query.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowered) ||
        option.description?.toLowerCase().includes(lowered)
    )
  }, [options, query])

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
      return
    }
    onChange([...selected, value])
  }

  const addCustom = () => {
    const trimmed = custom.trim()
    if (!trimmed) return
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed])
    }
    setCustom("")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder || "Search"}
          placeholderTextColor={theme.colors.muted}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {selected.length === 0 ? (
          <Text style={styles.empty}>No selections yet</Text>
        ) : (
          selected.map((value) => {
            const option = options.find((item) => item.value === value)
            return (
              <Pressable key={value} style={styles.chip} onPress={() => toggle(value)}>
                <Text style={styles.chipText}>{option?.label ?? value}</Text>
                <Ionicons name="close-circle" size={14} color={theme.colors.muted} />
              </Pressable>
            )
          })
        )}
      </ScrollView>

      <View style={styles.list}>
        {filtered.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <Pressable
              key={option.value}
              style={[styles.optionRow, isSelected ? styles.optionRowActive : null]}
              onPress={() => toggle(option.value)}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description ? (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                ) : null}
              </View>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={isSelected ? theme.colors.accent2 : theme.colors.muted}
              />
            </Pressable>
          )
        })}
      </View>

      <View style={styles.customRow}>
        <TextInput
          style={styles.customInput}
          value={custom}
          onChangeText={setCustom}
          placeholder="Add custom item"
          placeholderTextColor={theme.colors.muted}
        />
        <Pressable style={styles.addButton} onPress={addCustom}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  label: {
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    backgroundColor: theme.colors.panel
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text
  },
  chips: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.panelAlt,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 12
  },
  list: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.panel
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 10,
    backgroundColor: theme.colors.panel,
    color: theme.colors.text
  },
  addButton: {
    backgroundColor: theme.colors.accent2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12
  },
  optionRow: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  optionRowActive: {
    backgroundColor: "rgba(44, 123, 229, 0.08)"
  },
  optionLeft: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  optionLabel: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 14
  },
  optionDescription: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4
  }
})
