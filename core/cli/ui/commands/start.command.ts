import * as p from "@clack/prompts"
import os from "os"
import { startDaemon } from "../../daemon/lifecycle"
import { bootstrapGlobalConfig } from "../../services/auth.service"
import { persistToken, projectKey } from "#common/helpers/load-config.helper"
import type { HomeToken } from "#common/helpers/load-config.helper"
import type { IDEType } from "#common/types/ide.types"
import { askStartConfig } from "../prompts/start.prompts"

export async function startCommand(): Promise<void> {
    const agentName = os.userInfo().username

    const config = await askStartConfig()
    if (!config) return

    bootstrapGlobalConfig({ ideType: config.ideType as IDEType, remote: config.remote })

    // Login against the project server to obtain a session token
    let token: string
    try {
        const res = await fetch(`${config.serverUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: config.username, password: config.password }),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({})) as Record<string, unknown>
            p.log.error(`Login failed: ${(body as any).message ?? res.status}`)
            return
        }
        const body = await res.json() as { data: { token: string } }
        token = body.data.token
    } catch (err) {
        p.log.error(`Could not reach server: ${err instanceof Error ? err.message : String(err)}`)
        return
    }

    // Persist the session token so the agent can connect to this server on boot
    const key = projectKey(config.serverUrl, process.cwd())
    const homeToken: HomeToken = {
        serverUrl: config.serverUrl,
        token,
        username: config.username,
        projectCwd: process.cwd(),
    }
    persistToken(key, homeToken)

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
