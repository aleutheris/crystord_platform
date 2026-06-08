import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", ".astro", "playwright-report", "test-results"]),
  {
    files: ["**/*.{ts,mjs,cjs}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
  },
  ...astro.configs.recommended,
  // Launch integration boundaries: analytics and external form backends are not permitted (ADR-260004)
  {
    files: ["**/*.{ts,mjs,cjs,astro}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Identifier[name='gtag']",
          message: "gtag (Google Analytics) is not permitted at launch. See ADR-260004.",
        },
        {
          selector: "MemberExpression > Identifier[name='dataLayer']",
          message: "dataLayer (Google Tag Manager) is not permitted at launch. See ADR-260004.",
        },
      ],
    },
  },
]);
