
import fs from "fs"
import os from "os"
import path from "path"
import { spawn } from "child_process"
import { type IDaemonAdapter, type DaemonOptions } from "./base"

class WindowsDaemonAdapter implements IDaemonAdapter {
    getAgentDir(): string {
        const appData = process.env["APPDATA"] ?? path.join(os.homedir(), "AppData", "Roaming")
        return path.join(appData, "tooltify", "agents")
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
