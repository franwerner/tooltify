import * as p from "@clack/prompts"
import { getStatus } from "../../daemon/pid"
import { stopDaemon } from "../../daemon/lifecycle"

export function stopCommand(agentName: string): void {
    const { running, pid } = getStatus(agentName)
    if (!running) {
        p.log.warn(`Agent "${agentName}" is not running`)
        return
    }
    const spinner = p.spinner()
    spinner.start(`Stopping agent (${agentName})...`)
    try {
        stopDaemon(agentName)
        spinner.stop(`Agent stopped (${agentName}) — PID: ${pid}`)
    } catch (err) {
        spinner.stop("Failed to stop agent")
        p.log.error(err instanceof Error ? err.message : String(err))
    }
}
