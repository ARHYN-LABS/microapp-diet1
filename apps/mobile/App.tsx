import { DarkTheme, NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import HomeScreen from "./src/screens/HomeScreen"
import ScanScreen from "./src/screens/ScanScreen"
import ResultsScreen from "./src/screens/ResultsScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import { theme } from "./src/theme"

const Tab = createBottomTabNavigator()
const ScanStack = createNativeStackNavigator()

function ScanStackScreen() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen name="ScanHome" component={ScanScreen} options={{ title: "Scan" }} />
      <ScanStack.Screen name="Results" component={ResultsScreen} />
    </ScanStack.Navigator>
  )
}

export default function App() {
  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.colors.bg,
      card: theme.colors.panel,
      text: theme.colors.text,
      border: theme.colors.panelAlt
    }
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.panel },
          headerTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.panel,
            borderTopColor: theme.colors.panelAlt
          },
          tabBarActiveTintColor: theme.colors.accent2,
          tabBarInactiveTintColor: theme.colors.muted
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scan" component={ScanStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
