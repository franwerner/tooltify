import path from "path"
import { defineConfig, type Options } from "tsup"
import type { Plugin } from "esbuild"

const commonAliasPlugin: Plugin = {
  name: "common-alias",
  setup(build) {
    build.onResolve({ filter: /^#common\// }, async (args) => {
      const resolved = args.path.replace("#common/", path.resolve(__dirname, "./common") + "/")
      return await build.resolve(resolved, { resolveDir: args.resolveDir, kind: args.kind })
    })
  },
}

const sharedConfig: Partial<Options> = {
  format: ["esm"],
  platform: "node",
  splitting: false,
  outDir: "dist",
  external: ["socket.io", "express", "jsonwebtoken", "cors", "ws"],
  esbuildPlugins: [commonAliasPlugin],
}

export default defineConfig([
  {
    ...sharedConfig,
    entry: {
      index: "./index.ts",
      agent: "./agent/index.ts",
    },
    dts: true,
    clean: true,
  },
  {
    ...sharedConfig,
    entry: {
      cli: "./cli/index.ts",
    },
    dts: false,
    clean: false,
    banner: { js: "#!/usr/bin/env node" },
    onSuccess: "node -e \"require('fs').chmodSync('dist/cli.js', 0o755)\"",
  },
])
