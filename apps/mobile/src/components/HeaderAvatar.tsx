import { useCallback, useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { getProfile, getProfileCached, getProfilePrefs, getProfilePrefsCached } from "../storage/cache"
import { theme } from "../theme"
import { normalizeImageUrl } from "../utils/normalizeImageUrl"

export default function HeaderAvatar() {
  const navigation = useNavigation()
  const [photoUri, setPhotoUri] = useState<string | null>(() => {
    const cachedProfile = getProfileCached()
    const cachedPrefs = getProfilePrefsCached()
    return (
      normalizeImageUrl(cachedProfile?.avatarUrl) ||
      cachedPrefs.photoUri ||
      null
    )
  })

  const loadPhoto = useCallback(async () => {
    const profile = await getProfile()
    if (profile?.avatarUrl) {
      setPhotoUri(normalizeImageUrl(profile.avatarUrl))
      return
    }
    const prefs = await getProfilePrefs()
    setPhotoUri(prefs.photoUri || null)
  }, [])

  useEffect(() => {
    loadPhoto()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadPhoto()
    }, [loadPhoto])
  )

  const handlePress = () => {
    try {
      navigation.navigate("Settings" as never)
      return
    } catch {
      // ignore
    }
    const parent = navigation.getParent()
    parent?.navigate("MainTabs" as never, { screen: "Settings" } as never)
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{ paddingHorizontal: 16, paddingVertical: 6 }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.colors.panelAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} />
        ) : null}
      </View>
    </Pressable>
  )
}
