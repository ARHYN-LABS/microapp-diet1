require("react-native-gesture-handler")
require("react-native-url-polyfill/auto")
const { registerRootComponent } = require("expo")
const { default: App } = require("./App")

registerRootComponent(App)
