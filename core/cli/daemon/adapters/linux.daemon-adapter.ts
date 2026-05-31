
import fs from "fs"
import path from "path"
import { spawn } from "child_process"
import { type IDaemonAdapter, type DaemonOptions } from "./base"

class LinuxDaemonAdapter implements IDaemonAdapter {
    getAgentDir(): string {
        return "/tmp/tooltify/agents"
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

export { LinuxDaemonAdapter }
