const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ["dist/**", ".expo/**"],
    rules: {
      // React context actions and event callbacks are intentionally passed as values.
      "@typescript-eslint/unbound-method": "off",
      // TypeScript performs module/export checking. Expo's import resolver is not TS 6 compatible yet.
      "import/namespace": "off",
      "import/named": "off",
      "import/default": "off",
      "import/no-unresolved": "off",
      "import/no-duplicates": "off",
    },
  },
]);
