import * as p from "@clack/prompts"
import { listRunning, logFilePath } from "../../daemon/pid"
import { logFileExists, readLogSnapshot, tailLog } from "../../services/logs.service"
import { askSelectAgent } from "../prompts/logs.prompts"

export async function logsCommand(): Promise<void> {
    const running = listRunning()
    if (running.length === 0) {
        p.log.warn("No registered agents")
        return
    }

    const agentName = await askSelectAgent(running.map((a) => a.agentName))
    if (!agentName) return

    const logFile = logFilePath(agentName)
    if (!logFileExists(logFile)) {
        p.log.warn("No log file found for this agent")
        return
    }

    p.log.message(`Tailing ${logFile}  (Ctrl+C to exit)\n`)
    process.stdout.write(readLogSnapshot(logFile))

    const stopTail = tailLog(logFile, (chunk) => process.stdout.write(chunk))

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            stopTail()
            resolve()
        })
    })
}
