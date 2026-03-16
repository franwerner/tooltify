import fs from "fs"
import path from "path"
import { DaemonAdapter } from "."

const PID_DIR = DaemonAdapter.getAgentDir()
export function ensurePidDir(): void {
    fs.mkdirSync(PID_DIR, { recursive: true })
}

export function pidFilePath(agentName: string): string {
    return path.join(PID_DIR, `${agentName}.pid`)
}

export function logFilePath(agentName: string): string {
    return path.join(PID_DIR, `${agentName}.log`)
}

export function getStatus(agentName: string): { running: boolean; pid?: number } {
    const pidFile = pidFilePath(agentName)
    if (!fs.existsSync(pidFile)) return { running: false }
    const pid = parseInt(fs.readFileSync(pidFile, "utf-8").trim(), 10)
    try {
        process.kill(pid, 0)
        return { running: true, pid }
    } catch {
        return { running: false, pid }
    }
}

export function listRunning(): { agentName: string; pid: number }[] {
    if (!fs.existsSync(PID_DIR)) return []
    return fs
        .readdirSync(PID_DIR)
        .filter((f) => f.endsWith(".pid"))
        .map((f) => {
            const agentName = f.replace(".pid", "")
            const pid = parseInt(fs.readFileSync(path.join(PID_DIR, f), "utf-8").trim(), 10)
            return { agentName, pid }
        })
}
