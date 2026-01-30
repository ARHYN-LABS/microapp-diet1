import { useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { getProfile } from "../storage/cache"
import { theme } from "../theme"

export default function HeaderAvatar() {
  const navigation = useNavigation()
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  const loadPhoto = async () => {
    const profile = await getProfile()
    setPhotoUri(profile?.avatarUrl || null)
  }

  useEffect(() => {
    loadPhoto()
  }, [])

  useFocusEffect(() => {
    loadPhoto()
  })

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
