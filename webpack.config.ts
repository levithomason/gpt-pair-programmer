import * as path from "path";

import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import type { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

import { APP_ROOT, DIST_ROOT, PUBLIC_ROOT } from "./server/config.js";

export default {
  mode: "development",
  devtool: "eval-source-map",
  entry: path.join(APP_ROOT, "index.tsx"),
  output: {
    path: DIST_ROOT,
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.app.json",
          },
        },
      },
      {
        test: /\.css?$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|avif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [new HtmlWebpackPlugin()],
  devServer: {
    port: 3000,
    static: {
      directory: PUBLIC_ROOT,
    },
  } as DevServerConfiguration,
} as Configuration;
