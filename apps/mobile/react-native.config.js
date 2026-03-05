const path = require("path")
const root = path.resolve(__dirname, "../..")

module.exports = {
  dependencies: {
    "react-native-gesture-handler": {
      root: path.join(root, "node_modules", "react-native-gesture-handler"),
    },
    "react-native-reanimated": {
      root: path.join(root, "node_modules", "react-native-reanimated"),
    },
    "react-native-worklets": {
      root: path.join(root, "node_modules", "react-native-worklets"),
    },
    "react-native-screens": {
      root: path.join(root, "node_modules", "react-native-screens"),
    },
    "react-native-safe-area-context": {
      root: path.join(root, "node_modules", "react-native-safe-area-context"),
    },
    "react-native-svg": {
      root: path.join(root, "node_modules", "react-native-svg"),
    },
    "@react-native-async-storage/async-storage": {
      root: path.join(root, "node_modules", "@react-native-async-storage", "async-storage"),
    },
    "@react-native-community/slider": {
      root: path.join(root, "node_modules", "@react-native-community", "slider"),
    },
    "@react-native-community/datetimepicker": {
      root: path.join(root, "node_modules", "@react-native-community", "datetimepicker"),
    },
  },
}
