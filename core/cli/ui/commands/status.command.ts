import * as p from "@clack/prompts"
import { listRunning, getStatus } from "../../daemon/pid"

export function statusCommand(): void {
    const agents = listRunning()
    if (agents.length === 0) {
        p.log.warn("No registered agents")
        return
    }
    for (const a of agents) {
        const { running } = getStatus(a.agentName)
        p.log.message(`${running ? "●" : "○"} ${a.agentName}  PID: ${a.pid}  ${running ? "running" : "stopped"}`)
    }
}
