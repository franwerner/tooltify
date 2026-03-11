import { rsDevTools } from "../integrations/rspack.integration";

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
    extensions: [".tsx", ".ts", ".js"]
  },

  builtins: {
    html: [
      {
        template: "./index.html"
      }
    ]
  },

  devServer: {
    port: 5173,
    historyApiFallback: true
  }
};