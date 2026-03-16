import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant";
import { readFileSync } from "fs";
import path from "path";

export interface TooltifyConfig {
  port: number;
  configDir: string
  packagesDir: string;
  auth: {
    salt: string;
    secret: string;
  };
}
const DEFAULT_PORT = 4100

export function loadConfig(): TooltifyConfig {
  const baseDir = process.cwd()
  const configPath = path.resolve(baseDir, CONFIG_DIRNAME)
  let raw: string;
  try {
    raw = readFileSync(configPath, "utf-8")
  } catch {
    throw new Error(`[tooltify] config not found: ${configPath}`)
  }

  const config: TooltifyConfig = JSON.parse(raw)

  config.packagesDir = path.resolve(process.cwd(), config.packagesDir);

  config.port ||= DEFAULT_PORT

  return config;
}
