import { readFileSync } from "fs";
import path from "path";
import type { UserEntry } from "../services/auth.service";

export interface DevtoolsConfig {
  port?: number;
  packagesDir: string;
  auth: {
    secret: string;
    users: Record<string, UserEntry>;
  };
}

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
  const configDir = path.dirname(configPath);

  config.packagesDir = path.resolve(configDir, config.packagesDir);

  if (overrides.port) config.port = overrides.port;

  return config;
}
