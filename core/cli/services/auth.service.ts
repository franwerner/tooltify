import fs from "fs"
import path from "path"
import crypto from "crypto"
import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant"
import { loadGlobalConfig, GLOBAL_CONFIG_PATH } from "#common/helpers/load-config.helper"

export function assertTooltifyProject(): void {
    const configPath = path.join(process.cwd(), CONFIG_DIRNAME)
    if (!fs.existsSync(configPath)) {
        throw new Error(`${CONFIG_DIRNAME} not found. Run this command from a project where tooltify is configured.`)
    }
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
