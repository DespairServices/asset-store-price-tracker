/** 
 * https://prettier.io/docs/en/options
 * @type {import("prettier").Config} 
 * */
const config = {
  tailwindFunctions: [
    "clsx",
    "tw",
  ],
  plugins: [
    "prettier-plugin-organize-attributes",
    "prettier-plugin-organize-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-css-order",
    "prettier-plugin-tailwindcss",
  ],
};

export default config;
