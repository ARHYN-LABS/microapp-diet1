import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Camera, CameraType } from "expo-camera"
import { runAnalyze, saveHistory } from "../api/client"
import { useNavigation } from "@react-navigation/native"
import { theme } from "../theme"
import { getProfile, setLastAnalysis } from "../storage/cache"

type ImageState = {
  label?: { uri: string; name: string; type: string }
}

export default function ScanScreen() {
  const [status, setStatus] = useState("Capture one clear food or label photo.")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [image, setImage] = useState<ImageState>({})
  const cameraRef = useRef<Camera | null>(null)
  const navigation = useNavigation()

  useEffect(() => {
    const request = async () => {
      const { status: permissionStatus } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(permissionStatus === "granted")
    }

    request()
  }, [])

  const capturePhoto = async () => {
    if (!cameraRef.current) return
    setStatus("Capturing photo...")

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      const file = {
        uri: photo.uri,
        name: "label.jpg",
        type: "image/jpeg"
      }

      setImage({ label: file })
      setStatus("Ready to analyze.")
    } catch {
      setStatus("Unable to capture photo.")
    }
  }

  const handleAnalyze = async () => {
    if (!image.label) {
      setStatus("Please capture a clear food or label photo.")
      return
    }

    setStatus("Analyzing image...")
    const formData = new FormData()
    formData.append("frontImage", image.label as unknown as Blob)
    const profile = await getProfile()
    if (profile?.id) {
      formData.append("userId", profile.id)
    }

    try {
      const analysis = await runAnalyze(formData)
      await setLastAnalysis(analysis)
      if (profile?.id) {
        await saveHistory({
          userId: profile.id,
          extractedText: analysis.parsing.extractedText,
          parsedIngredients: analysis.ingredientBreakdown.map((item) => item.name),
          parsedNutrition: analysis.nutritionHighlights,
          analysisSnapshot: analysis
        })
      }

      navigation.navigate("Results" as never, {
        analysis
      } as never)
    } catch (error) {
      setStatus((error as Error).message || "Unable to analyze image.")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Scan</Text>
          <Text style={styles.subtitle}>{status}</Text>
        </View>
        <View style={styles.progressPill}>
          <Text style={styles.progressLabel}>Captured</Text>
          <Text style={styles.progressValue}>{image.label ? "100%" : "0%"}</Text>
        </View>
      </View>

      {hasPermission === false ? (
        <Text style={styles.subtitle}>Camera permission is required.</Text>
      ) : (
        <View style={styles.cameraWrap}>
          <Camera style={styles.camera} type={CameraType.back} ref={cameraRef} />
          <View style={styles.cameraOverlay}>
            <View style={styles.frameBox} />
            <View style={styles.overlayHint}>
              <Text style={styles.overlayText}>Fill the frame. Avoid glare.</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable style={styles.captureButton} onPress={capturePhoto}>
          <Text style={styles.captureButtonText}>●</Text>
        </Pressable>
        <Pressable style={styles.primaryAction} onPress={handleAnalyze}>
          <Text style={styles.primaryActionText}>Analyze</Text>
        </Pressable>
      </View>

      <Pressable style={styles.secondaryButton} onPress={() => setImage({})}>
        <Text style={styles.secondaryButtonText}>Reupload image</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Captured</Text>
        <Text style={styles.captureLine}>
          Food or label photo: {image.label ? "Ready" : "Required"}
        </Text>
      </View>

      <Text style={styles.disclaimer}>Educational, not medical advice.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.bg
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: theme.colors.text,
    fontFamily: theme.font.heading
  },
  subtitle: {
    color: theme.colors.muted
  },
  progressPill: {
    backgroundColor: theme.colors.glass,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  progressLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  progressValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4
  },
  cameraWrap: {
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  camera: {
    width: "100%",
    height: 320
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)"
  },
  frameBox: {
    width: "80%",
    height: "70%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: theme.radius.lg
  },
  overlayHint: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  overlayText: {
    color: theme.colors.text,
    fontSize: 12
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing.md
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: theme.colors.glassStrong,
    borderWidth: 2,
    borderColor: theme.colors.accent2,
    alignItems: "center",
    justifyContent: "center"
  },
  captureButtonText: {
    color: theme.colors.accent2,
    fontSize: 24,
    marginTop: -4
  },
  primaryAction: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center"
  },
  primaryActionText: {
    color: "#02130c",
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: theme.colors.glass,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  section: {
    backgroundColor: theme.colors.glass,
    padding: 14,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: theme.colors.text
  },
  captureLine: {
    color: theme.colors.muted
  },
  disclaimer: {
    marginTop: 16,
    color: theme.colors.muted,
    textAlign: "center"
  }
})
