import * as p from "@clack/prompts"
import os from "os"
import { startDaemon } from "../../daemon/lifecycle"
import { bootstrapGlobalConfig, computeHash, persistUserHash } from "../../services/auth.service"
import { loadGlobalConfig } from "#common/helpers/load-config.helper"
import { askPasswordAndConfirm } from "../prompts/auth.prompts"
import { askStartConfig } from "../prompts/start.prompts"
import type { IDEType } from "#common/types/ide.types"

export async function startCommand(): Promise<void> {
    const agentName = os.userInfo().username

    const config = await askStartConfig()
    if (!config) return

    bootstrapGlobalConfig({ ideType: config.ideType as IDEType, remote: config.remote })

    let globalConfig = (() => { try { return loadGlobalConfig() } catch { return null } })()

    if (!globalConfig?.auth?.users?.[agentName]) {
        p.log.warn("No credentials found. Please register first.")
        const result = await askPasswordAndConfirm()
        if (!result) return
        const hash = computeHash(result.password)
        persistUserHash(agentName, hash)
        p.log.success(`User "${agentName}" registered`)
    }

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
