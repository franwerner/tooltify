import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import crypto from "crypto";
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
  // Solo runtime: se deriva de TOOLTIFY_HOST_ROOT, no se configura en el JSON.
  editorPathMap?: EditorPathMap;
}

export interface GlobalConfig {
  agentPort: number;
  ideType: IDEType;
  remote: boolean;
}

export interface ProjectAuthStore {
  salt: string;
  secret: string;
  users: Record<string, { hash: string }>;
}

export interface HomeToken {
  serverUrl: string;
  token: string;
  username: string;
  projectCwd: string;
}

const DEFAULT_PORT = 4100;
const DEFAULT_AGENT_PORT = 41030;
const HOST_ROOT_ENV = "TOOLTIFY_HOST_ROOT";
const GLOBAL_CONFIG_PATH = path.join(os.homedir(), ".tooltify", "config.json");

export function projectAuthStorePath(projectCwd: string): string {
  return path.join(projectCwd, ".tooltify", "auth.json");
}

export function homeTokensDir(): string {
  return path.join(os.homedir(), ".tooltify", "tokens");
}

export function projectKey(serverUrl: string, cwd: string): string {
  const url = new URL(serverUrl);
  const hostPort = url.host;
  return crypto.createHash("sha256").update(`${hostPort}:${cwd}`).digest("hex").slice(0, 16);
}

export function loadProjectAuthStore(projectCwd: string): ProjectAuthStore | null {
  const storePath = projectAuthStorePath(projectCwd);
  try {
    const raw = readFileSync(storePath, "utf-8");
    return JSON.parse(raw) as ProjectAuthStore;
  } catch {
    return null;
  }
}

export function writeProjectAuthStore(projectCwd: string, store: ProjectAuthStore): void {
  const storePath = projectAuthStorePath(projectCwd);
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2), { mode: 0o600 });
}

export function loadToken(key: string): HomeToken | null {
  const tokenPath = path.join(homeTokensDir(), `${key}.json`);
  try {
    const raw = readFileSync(tokenPath, "utf-8");
    return JSON.parse(raw) as HomeToken;
  } catch {
    return null;
  }
}

export function persistToken(key: string, data: HomeToken): void {
  const dir = homeTokensDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${key}.json`), JSON.stringify(data, null, 2), { mode: 0o600 });
}

export function listTokens(): HomeToken[] {
  const dir = homeTokensDir();
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(readFileSync(path.join(dir, f), "utf-8")) as HomeToken;
        } catch {
          return null;
        }
      })
      .filter((t): t is HomeToken => t !== null);
  } catch {
    return [];
  }
}

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

  // El remapeo de rutas es solo por env: cuando el server corre en container,
  // las rutas que resuelve (bajo cwd) no existen en el host donde el agente
  // abre el editor. Si el host exporta su raíz, mapeamos cwd→host. Se ignora
  // cualquier editorPathMap del JSON.
  const hostRoot = process.env[HOST_ROOT_ENV];
  config.editorPathMap = hostRoot ? { from: baseDir, to: hostRoot } : undefined;

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
