import type { Options } from "tsup";

export function createTsupConfig(options: {
  entry: Record<string, string>;
  external?: string[];
}): Options {
  return {
    entry: options.entry,
    format: ["esm"],
    dts: true,
    splitting: false,
    clean: true,
    outDir: "dist",
    external: options.external,
  };
}
