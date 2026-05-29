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
});
