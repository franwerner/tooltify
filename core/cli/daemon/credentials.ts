import fs from "fs"
import { DaemonAdapter } from "."

export function readCredentials(): { hash: string } | null {
    const credPath = DaemonAdapter.getCredentialsPath()
    if (!fs.existsSync(credPath)) return null
    return JSON.parse(fs.readFileSync(credPath, "utf-8"))
}

export function writeCredentials(hash: string): void {
    const credPath = DaemonAdapter.getCredentialsPath()
    fs.writeFileSync(credPath, JSON.stringify({ hash }, null, 2), { mode: 0o600 })
}
