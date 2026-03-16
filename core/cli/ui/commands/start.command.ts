import * as p from "@clack/prompts"
import os from "os"
import { readCredentials, writeCredentials } from "../../daemon/credentials"
import { startDaemon } from "../../daemon/lifecycle"
import { computeHash, persistUserHash } from "../../services/auth.service"
import { askPasswordAndConfirm } from "../prompts/auth.prompts"
import { askStartConfig } from "../prompts/start.prompts"

export async function startCommand(): Promise<void> {
    const agentName = os.userInfo().username

    if (!readCredentials()) {
        p.log.warn("No credentials found. Please register first.")
        const result = await askPasswordAndConfirm()
        if (!result) return
        const hash = computeHash(result.password)
        writeCredentials(hash)
        persistUserHash(agentName, hash)
        p.log.success(`User "${agentName}" registered`)
    }

    const config = await askStartConfig()
    if (!config) return

    const spinner = p.spinner()
    spinner.start(`Starting agent (${agentName})...`)
    try {
        const { hash } = readCredentials()!
        const pid = startDaemon({ agentName, hash, ...config })
        spinner.stop(`Agent started (${agentName}) — PID: ${pid}`)
    } catch (err) {
        spinner.stop("Failed to start agent")
        p.log.error(err instanceof Error ? err.message : String(err))
    }
}
