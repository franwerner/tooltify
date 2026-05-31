import fs from "fs"
import path from "path"
import crypto from "crypto"
import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant"
import { loadGlobalConfig, GLOBAL_CONFIG_PATH, type GlobalConfig } from "#common/helpers/load-config.helper"
import type { IDEType } from "#common/types/ide.types"

const DEFAULT_AGENT_PORT = 41030

export function assertTooltifyProject(): void {
    const configPath = path.join(process.cwd(), CONFIG_DIRNAME)
    if (!fs.existsSync(configPath)) {
        throw new Error(`${CONFIG_DIRNAME} not found. Run this command from a project where tooltify is configured.`)
    }
}

export function bootstrapGlobalConfig(opts: { ideType: IDEType; remote: boolean }): void {
    const existing = (() => { try { return loadGlobalConfig() } catch { return null } })()
    if (existing) {
        const updated: GlobalConfig = {
            ...existing,
            ideType: opts.ideType,
            remote: opts.remote,
        }
        fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(updated, null, 2), { mode: 0o600 })
        return
    }
    const dir = path.dirname(GLOBAL_CONFIG_PATH)
    fs.mkdirSync(dir, { recursive: true })
    const initial: GlobalConfig = {
        agentPort: DEFAULT_AGENT_PORT,
        ideType: opts.ideType,
        remote: opts.remote,
        auth: {
            salt: crypto.randomBytes(16).toString("hex"),
            secret: crypto.randomBytes(32).toString("hex"),
            users: {},
        },
    }
    fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(initial, null, 2), { mode: 0o600 })
}

export function computeHash(password: string): string {
    const { auth } = loadGlobalConfig()
    return crypto.createHash("sha256").update(auth.salt + password).digest("hex")
}

export function persistUserHash(username: string, hash: string): void {
    const config = loadGlobalConfig()
    config.auth.users[username] = { hash }
    fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 })
}
