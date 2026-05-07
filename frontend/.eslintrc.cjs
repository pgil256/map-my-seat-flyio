module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.cjs",
    "vite.config.js",
    "vite.config.js.timestamp-*.mjs",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: "18.2" },
  },
  plugins: ["react-refresh"],
  rules: {
    // Vitest globals (describe/it/expect/vi/...) come from vite.config.js test.globals=true
    "no-undef": "error",
    "no-unused-vars": [
      "warn",
      {
        // Many demo-mode API methods mirror the real API signature even when
        // they don't use every parameter (e.g. username). Don't flag those.
        args: "none",
        varsIgnorePattern: "^_",
      },
    ],
    "react/prop-types": "off",
    // ' and " in JSX text render correctly; the rule is stylistic, not a bug catcher.
    "react/no-unescaped-entities": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.{js,jsx}", "src/setupTests.js"],
      env: {
        // Vitest exposes describe/it/expect/vi globally when globals: true
        node: true,
      },
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        beforeAll: "readonly",
        afterEach: "readonly",
        afterAll: "readonly",
      },
    },
  ],
};
