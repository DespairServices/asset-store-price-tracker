"use strict";

const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const paths = {
  src: path.resolve(__dirname, "../src"),
  out: path.resolve(__dirname, "../out"),
};

const config = function(env, argv) {
  return {
    entry: {
      "popup": paths.src + "/popup.tsx",
      "content-script-unity": paths.src + "/content-script-unity.tsx",
      "content-script-unreal": paths.src + "/content-script-unreal.tsx",
      "background": paths.src + "/background.tsx",
      "constants": paths.src + "/constants.tsx",
    },
    mode: env.production ? "production" : "development",
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
          test: /\.ts(x)?$/,
          loader: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: true,
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
      new CopyWebpackPlugin({
        patterns: [
          {
            context: "public",
            from: "**/*",
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
