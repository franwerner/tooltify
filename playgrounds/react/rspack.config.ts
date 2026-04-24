import { HtmlRspackPlugin } from "@rspack/core";
import { rspackTooltify } from "@tooltify/integration-rspack";
import { Runtime } from "@tooltify/integration-shared";
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
    rspackTooltify({
      runtime: {
        type: Runtime.REACT,
        shouldInjectSource: (type: any) => {
          return typeof type === "object" && typeof type?.target === "string"
        },
      }
    })
  ],

  devServer: {
    port: 5173,
    historyApiFallback: true,
    // proxy: [
    //   {
    //     context: ['/tooltify'],
    //     target: 'http://localhost:4101',
    //     changeOrigin: true,
    //     pathRewrite: { '^/tooltify': '' },
    //     ws: true,
    //   },
    // ],
  }
};
