import { HtmlRspackPlugin } from "@rspack/core";
import { rspackTooltify } from "@tooltify/integration/rspack";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default {
  entry: "./src/index.tsx",

  output: {
    publicPath: "/"
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true
            },
            transform: {
              react: {
                runtime: "automatic"
              }
            }
          }
        }
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "react": require.resolve("react")
    }
  },

  plugins: [
    new HtmlRspackPlugin({ template: "./index.html" }),
    rspackTooltify()
  ],

  devServer: {
    port: 5173,
    historyApiFallback: true
  }
};
