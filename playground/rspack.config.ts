import { rsDevTools } from "../integrations/rspack.integration";

export default {
  entry: "./src/index.tsx",
  plugins: [rsDevTools()],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  devServer: {
    port: 3099,
  },
  builtins: {
    html: [{ template: "./index.html" }],
  },
};
