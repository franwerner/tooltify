import fs from "fs"
import path from "path"
import { DaemonAdapter } from "."

export interface AgentSettings {
    ideType: string
    remote: boolean
    cwd: string
}

export function settingsFilePath(agentName: string): string {
    return path.join(DaemonAdapter.getAgentDir(), `${agentName}.settings.json`)
}

export function readSettings(agentName: string): AgentSettings | null {
    const settingsFile = settingsFilePath(agentName)
    if (!fs.existsSync(settingsFile)) return null
    return JSON.parse(fs.readFileSync(settingsFile, "utf-8"))
}

export function writeSettings(agentName: string, settings: AgentSettings): void {
    fs.writeFileSync(settingsFilePath(agentName), JSON.stringify(settings, null, 2))
}
