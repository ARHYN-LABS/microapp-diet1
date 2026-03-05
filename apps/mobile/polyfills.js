// FormData polyfill — injected by Metro BEFORE all module definitions.
// In RN 0.81 New Architecture (Bridgeless), module factories can evaluate
// before InitializeCore's __r() call, so FormData must exist in the
// bundle prelude. Uses ES5 function syntax for max Hermes bytecode compat.
(function (g) {
  if (typeof g.FormData !== "undefined") return;
  function FormData() {
    this._parts = [];
  }
  FormData.prototype.append = function (key, value, fileName) {
    this._parts.push([key, value, fileName]);
  };
  FormData.prototype.getParts = function () {
    return this._parts.map(function (entry) {
      var name = entry[0],
        value = entry[1];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof String)
      ) {
        var copy = {};
        var keys = Object.keys(value);
        for (var i = 0; i < keys.length; i++) copy[keys[i]] = value[keys[i]];
        copy.fieldName = name;
        return copy;
      }
      return { string: String(value), fieldName: name };
    });
  };
  g.FormData = FormData;
})(typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this);
