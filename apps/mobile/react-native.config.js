const path = require("path")

// Monorepo: packages are hoisted to root node_modules
const rootModules = path.resolve(__dirname, "..", "..", "node_modules")

module.exports = {
  dependencies: {
    "react-native-gesture-handler": {
      root: path.join(rootModules, "react-native-gesture-handler"),
    },
    "react-native-reanimated": {
      root: path.join(rootModules, "react-native-reanimated"),
    },
    "react-native-worklets": {
      root: path.join(rootModules, "react-native-worklets"),
    },
    "react-native-screens": {
      root: path.join(rootModules, "react-native-screens"),
    },
    "react-native-safe-area-context": {
      root: path.join(rootModules, "react-native-safe-area-context"),
    },
    "react-native-svg": {
      root: path.join(rootModules, "react-native-svg"),
    },
    "@react-native-async-storage/async-storage": {
      root: path.join(rootModules, "@react-native-async-storage", "async-storage"),
    },
    "@react-native-community/slider": {
      root: path.join(rootModules, "@react-native-community", "slider"),
    },
    "@react-native-community/datetimepicker": {
      root: path.join(rootModules, "@react-native-community", "datetimepicker"),
    },
  },
}
