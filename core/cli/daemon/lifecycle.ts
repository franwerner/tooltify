import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { ensurePidDir, getStatus, pidFilePath, logFilePath } from "./pid"
import { settingsFilePath, type AgentSettings } from "./settings"
import { DaemonAdapter } from "."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface StartOptions {
    agentName: string
    ideType: string
    remote: boolean
    hash: string
}

export function startDaemon(options: StartOptions): number {
    ensurePidDir()
    const existing = getStatus(options.agentName)
    if (existing.running && existing.pid) {
        process.kill(existing.pid)
    }
    const agentEntry = path.resolve(__dirname, "./agent.js")
    const pid = DaemonAdapter.start({
        agentEntry,
        cwd: process.cwd(),
        logFile: logFilePath(options.agentName),
        env: {
            ...(process.env as Record<string, string>),
            AGENT_NAME: options.agentName,
            IDE_TYPE: options.ideType,
            REMOTE: String(options.remote),
            AGENT_HASH: options.hash,
        },
    })
    fs.writeFileSync(pidFilePath(options.agentName), String(pid))
    fs.writeFileSync(settingsFilePath(options.agentName), JSON.stringify({
        ideType: options.ideType,
        remote: options.remote,
        cwd: process.cwd(),
    } satisfies AgentSettings, null, 2))
    return pid
}

export function stopDaemon(agentName: string): void {
    const pidFile = pidFilePath(agentName)
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8").trim(), 10)
    process.kill(pid)
    fs.unlinkSync(pidFile)
}
