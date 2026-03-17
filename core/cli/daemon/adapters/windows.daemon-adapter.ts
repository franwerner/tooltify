
import fs from "fs"
import os from "os"
import path from "path"
import { spawn } from "child_process"
import { type IDaemonAdapter, type DaemonOptions } from "./base"

class WindowsDaemonAdapter implements IDaemonAdapter {
    getAgentDir(): string {
        const programData = process.env["ProgramData"] ?? "C:\\ProgramData"
        return path.join(programData, "tooltify", "agents")
    }

    getCredentialsPath(): string {
        const appData = process.env["APPDATA"] ?? path.join(os.homedir(), "AppData", "Roaming")
        const credPath = path.join(appData, "tooltify", "credentials.json")
        fs.mkdirSync(path.dirname(credPath), { recursive: true })
        return credPath
    }

    start(options: DaemonOptions): number {
        const logFd = fs.openSync(options.logFile, "a")
        const child = spawn("node", [options.agentEntry], {
            detached: true,
            stdio: ["ignore", logFd, logFd],
            cwd: options.cwd,
            env: options.env,
        })
        child.unref()
        fs.closeSync(logFd)
        return child.pid!
    }
}

export { WindowsDaemonAdapter }
