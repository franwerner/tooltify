import fs from "fs"
import path from "path"
import crypto from "crypto"
import { CONFIG_DIRNAME } from "#common/constant/configDirname.constant"

export function assertTooltifyProject(): void {
    const configPath = path.join(process.cwd(), CONFIG_DIRNAME)
    if (!fs.existsSync(configPath)) {
        throw new Error(`${CONFIG_DIRNAME} not found. Run this command from a project where tooltify is configured.`)
    }
}

export function computeHash(password: string): string {
    const configPath = path.join(process.cwd(), CONFIG_DIRNAME)
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    return crypto.createHash("sha256").update(config.auth.salt + password).digest("hex")
}

export function persistUserHash(username: string, hash: string): void {
    const configPath = path.join(process.cwd(), CONFIG_DIRNAME)
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    config.auth.users[username] = { hash }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}
