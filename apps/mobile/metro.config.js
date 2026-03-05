const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so changes in packages/shared are picked up
config.watchFolders = [monorepoRoot];

// Resolve modules from both the mobile app and monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Inject FormData polyfill into the bundle PRELUDE — before all module
// definitions and before InitializeCore. This is the only way to guarantee
// FormData exists when New Architecture / Bridgeless mode evaluates module
// factories before __r(InitializeCore) runs.
const defaultGetPolyfills = config.serializer.getPolyfills;
config.serializer.getPolyfills = (options) => {
  const defaults = defaultGetPolyfills ? defaultGetPolyfills(options) : [];
  return [
    path.resolve(projectRoot, "polyfills.js"),
    ...defaults,
  ];
};

module.exports = config;
