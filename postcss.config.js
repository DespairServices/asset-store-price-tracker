/** @type {import("postcss-load-config").Config} */
const config = {
  plugins: {
    tailwindcss: {},
    "postcss-flexbugs-fixes": {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009",
        //grid: true,
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
  },
};

export default config;
