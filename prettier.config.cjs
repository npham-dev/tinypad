/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 80,
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  semi: true,
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
};

module.exports = config;
