module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier
    "next/core-web-vitals",
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y", "prettier"],
  rules: {
    "prettier/prettier": "error", // Show prettier issues as ESLint errors
    // Your custom rules here
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
