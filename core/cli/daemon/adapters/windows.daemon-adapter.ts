
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
        spawn(
            "powershell",
            ["-Command", `Start-Process node -ArgumentList '${options.agentEntry}' -WorkingDirectory '${options.cwd}' -RedirectStandardOutput '${options.logFile}' -RedirectStandardError '${options.logFile}' -WindowStyle Hidden`],
            { env: options.env }
        )
        return 0
    }
}

export { WindowsDaemonAdapter }
