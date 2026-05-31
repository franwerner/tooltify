import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant";
import { readFileSync } from "fs";
import os from "os";
import path from "path";
import type { IDEType } from "#common/types/ide.types";

export interface EditorPathMap {
  from: string;
  to: string;
}

export interface TooltifyConfig {
  port: number;
  host: string;
  packagesDir: string;
  editorPathMap?: EditorPathMap;
}

export interface GlobalConfig {
  agentPort: number;
  ideType: IDEType;
  remote: boolean;
  auth: {
    salt: string;
    secret: string;
    users: Record<string, { hash: string }>;
  };
}

const DEFAULT_PORT = 4100;
const DEFAULT_AGENT_PORT = 41030;
const GLOBAL_CONFIG_PATH = path.join(os.homedir(), ".tooltify", "config.json");

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

  config.packagesDir = path.resolve(baseDir, config.packagesDir);

  config.port ||= DEFAULT_PORT

  return config;
}

export function loadGlobalConfig(): GlobalConfig {
  let raw: string;
  try {
    raw = readFileSync(GLOBAL_CONFIG_PATH, "utf-8");
  } catch {
    throw new Error(
      `[tooltify] global config not found at ${GLOBAL_CONFIG_PATH}. Run \`tooltify start\` to register.`
    );
  }

  const config = JSON.parse(raw) as GlobalConfig;
  config.agentPort ||= DEFAULT_AGENT_PORT;
  return config;
}

export { GLOBAL_CONFIG_PATH };
