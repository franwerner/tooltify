import * as p from "@clack/prompts"
import os from "os"
import { getStatus } from "../../daemon/pid"
import { stopDaemon, startDaemon } from "../../daemon/lifecycle"
import { computeHash, persistUserHash } from "../../services/auth.service"
import { askPasswordAndConfirm } from "../prompts/auth.prompts"

export async function resetPasswordCommand(agentName: string): Promise<void> {
    const result = await askPasswordAndConfirm("new ")
    if (!result) return

    const hash = computeHash(result.password)
    persistUserHash(os.userInfo().username, hash)
    p.log.success(`Password reset for "${agentName}"`)

    const { running } = getStatus(agentName)
    if (!running) return

    const spinner = p.spinner()
    spinner.start(`Restarting agent (${agentName})...`)
    try {
        stopDaemon(agentName)
        const pid = startDaemon({ agentName })
        spinner.stop(`Agent restarted (${agentName}) — PID: ${pid}`)
    } catch (err) {
        spinner.stop("Failed to restart agent")
        p.log.error(err instanceof Error ? err.message : String(err))
    }
}
