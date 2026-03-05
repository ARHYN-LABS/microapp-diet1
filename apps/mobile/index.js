// Polyfill FormData INLINE before any other code runs.
// Hermes + New Architecture (BridgelessReact) may not have RN's
// InitializeCore globals ready yet. Use 'global' (not globalThis)
// and function-constructor syntax for max Hermes compatibility.
;(function () {
  if (typeof FormData !== "undefined") return
  function _FormData() {
    this._parts = []
  }
  _FormData.prototype.append = function (key, value, fileName) {
    this._parts.push([key, value, fileName])
  }
  _FormData.prototype.getParts = function () {
    return this._parts.map(function (entry) {
      var name = entry[0],
        value = entry[1]
      if (
        typeof value === "object" &&
        value &&
        !Array.isArray(value) &&
        !(value instanceof String)
      ) {
        var copy = {}
        var keys = Object.keys(value)
        for (var i = 0; i < keys.length; i++) copy[keys[i]] = value[keys[i]]
        copy.fieldName = name
        return copy
      }
      return { string: String(value), fieldName: name }
    })
  }
  global.FormData = _FormData
  if (typeof globalThis !== "undefined") globalThis.FormData = _FormData
})()

require("react-native-gesture-handler")
require("react-native-url-polyfill/auto")
var _expo = require("expo")
var _App = require("./App")

_expo.registerRootComponent(_App.default)
