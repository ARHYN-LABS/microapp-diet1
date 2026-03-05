// Polyfill FormData for Hermes + New Architecture (BridgelessReact)
// RN's InitializeCore may not have run yet when the bundle evaluates
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = class FormData {
    _parts = []
    append(key, value, fileName) {
      this._parts.push([key, value, fileName])
    }
    getParts() {
      return this._parts.map(([name, value, fileName]) => {
        if (
          typeof value === "object" &&
          value &&
          !Array.isArray(value) &&
          !(value instanceof String)
        ) {
          return { ...value, fieldName: name }
        }
        return { string: String(value), fieldName: name }
      })
    }
  }
}
