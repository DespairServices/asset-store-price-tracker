"use strict";

const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const glob = require("glob");


const config = function (env, argv) {
  console.log(`Building for ${env.mode} mode with ${env.background} background.`);

  if (env.mode !== "production" && env.mode !== "development") {
    throw new Error("Invalid mode. Please specify 'production' or 'development'.");
  }

  if (env.background !== "scripts" && env.background !== "service_worker") {
    throw new Error("Invalid background. Please specify 'scripts' or 'service_worker'.");
  }

  const paths = {
    src: path.resolve(__dirname, "src"),
    out: path.resolve(__dirname, "out", env.background),
  };

  const entry = glob.sync(paths.src + "/**/*.ts").reduce((acc, filePath) => {
    const entryName = path.relative(paths.src, filePath).replace(/\.ts$/, "");
    acc[entryName] = path.resolve(__dirname, filePath);
    return acc;
  }, {});

  return {
    entry: entry,
    mode: env.mode,
    output: {
      path: paths.out,
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.html$/i,
          type: "asset/resource",
        },
        {
          test: /\.json$/i,
          type: "asset/resource",
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          type: "asset",
        },
        {
          test: /\.ts$/,
          loader: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts"],
    },
    optimization: {
      minimize: env.mode === "production",
      minimizer: [
        new CssMinimizerPlugin({
          exclude: /\.min/,
        }),
        new HtmlMinimizerPlugin(),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              encodeOptions: {
                jpeg: {
                  // https://sharp.pixelplumbing.com/api-output#jpeg
                  quality: 100,
                },
                webp: {
                  // https://sharp.pixelplumbing.com/api-output#webp
                  lossless: true,
                },
                avif: {
                  // https://sharp.pixelplumbing.com/api-output#avif
                  lossless: true,
                },
                // png by default sets the quality to 100%, which is same as lossless
                // https://sharp.pixelplumbing.com/api-output#png
                png: {},
                // gif does not support lossless compression at all
                // https://sharp.pixelplumbing.com/api-output#gif
                gif: {},
              },
            },
          },
        }),
        new JsonMinimizerPlugin(),
        new TerserPlugin({
          exclude: /\.min/,
        }),
      ],
    },
    plugins: [
      // https://stackoverflow.com/questions/36205819/webpack-how-can-we-conditionally-use-a-plugin
      new CopyWebpackPlugin({
        patterns: [
          {
            context: "public",
            from: "manifest.json",
            to: paths.out,
            transform(content) {
              const manifest = JSON.parse(content.toString());

              if (!manifest.background) {
                manifest.background = {};
                background.type = "module";
              }

              if (env.background === "service_worker") {
                manifest.background.service_worker = "background.js";
              } else if (env.background === "scripts") {
                manifest.background.scripts = ["background.js"];
              } else {
                throw new Error("Invalid background. Please specify 'scripts' or 'service_worker'.");
              }

              return JSON.stringify(manifest, null, 2);
            },
          },
          {
            from: "public",
            to: paths.out,
            globOptions: {
              ignore: ["**/manifest.json"], // Ensure manifest.json is not copied again
            },
          },
        ],
      }),

    ],
    devtool: env.production ? false : "source-map",
    stats: {
      all: false,
      errors: true,
      builtAt: true,
    },
  }
};

module.exports = config;
