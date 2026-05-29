import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",
  plugins: [
    "eslint",
    "unicorn",
    "react",
    "react-perf",
    "oxc",
    "import",
    "jsx-a11y",
    "promise",
    "vitest",
  ],
  categories: {
    correctness: "error",
    suspicious: "warn",
    pedantic: "warn",
    perf: "error",
    restriction: "error",
  },
  rules: {
    "no-bitwise": "off",
    "no-undefined": "off",
    "import/no-default-export": "off",
    "import/no-relative-parent-imports": "off",
    "import/no-unassigned-import": "off",
    "oxc/no-async-await": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "react/react-in-jsx-scope": "off",
  },
  overrides: [
    {
      files: ["*.test.{js,jsx}"],
      rules: {
        "max-lines": "off",
        "max-lines-per-function": "off",
        "vitest/require-test-timeout": "off",
      },
    },
  ],
});
