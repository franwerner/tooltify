import * as p from "@clack/prompts"
import os from "os"
import { startDaemon } from "../../daemon/lifecycle"
import { bootstrapGlobalConfig } from "../../services/auth.service"
import { askStartConfig } from "../prompts/start.prompts"
import type { IDEType } from "#common/types/ide.types"

// TODO(batch-2): rewrite flow — prompt serverUrl, POST /auth/login, persist HomeToken, start agent
export async function startCommand(): Promise<void> {
    const agentName = os.userInfo().username

    const config = await askStartConfig()
    if (!config) return

    bootstrapGlobalConfig({ ideType: config.ideType as IDEType, remote: config.remote })

    const spinner = p.spinner()
    spinner.start(`Starting agent (${agentName})...`)
    try {
        const pid = startDaemon({ agentName })
        spinner.stop(`Agent started (${agentName}) — PID: ${pid}`)
    } catch (err) {
        spinner.stop("Failed to start agent")
        p.log.error(err instanceof Error ? err.message : String(err))
    }
}
