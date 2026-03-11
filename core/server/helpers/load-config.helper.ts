import { readFileSync } from "fs";
import path from "path";
import type { UserEntry } from "../services/auth.service";

export interface DevtoolsConfig {
  port?: number;
  packagesDir: string;
  auth: {
    salt: string;
    secret: string;
    users: Record<string, UserEntry>;
  };
}
const DEFAULT_PORT = 4100;


export function loadConfig(overrides: { port?: number; configDir?: string } = {}): DevtoolsConfig {
  const baseDir = overrides.configDir || process.cwd();
  const configPath = path.resolve(baseDir, "devtools.config.json");
  let raw: string;
  try {
    raw = readFileSync(configPath, "utf-8");
  } catch {
    throw new Error(`[devtools] config not found: ${configPath}`);
  }

  const config: DevtoolsConfig = JSON.parse(raw);

  config.packagesDir = path.resolve(process.cwd(), config.packagesDir);

  config.port = overrides.port || DEFAULT_PORT

  return config;
}
