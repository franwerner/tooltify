import * as p from "@clack/prompts"
import os from "os"
import { startDaemon } from "../../daemon/lifecycle"
import { bootstrapGlobalConfig } from "../../services/auth.service"
import { loadConfig, persistToken, projectKey } from "#common/helpers/load-config.helper"
import type { HomeToken } from "#common/helpers/load-config.helper"
import type { IDEType } from "#common/types/ide.types"
import { askStartConfig } from "../prompts/start.prompts"

export async function startCommand(): Promise<void> {
    const agentName = os.userInfo().username
    const serverUrl = `http://localhost:${loadConfig().port}`

    const config = await askStartConfig()
    if (!config) return

    bootstrapGlobalConfig({ ideType: config.ideType as IDEType, remote: config.remote })

    // En el primer arranque el usuario aún no existe en el store del proyecto;
    // un 404 dispara el registro (bootstrap del owner) antes de reintentar el login.
    let token: string
    try {
        const headers = { "Content-Type": "application/json" }
        const credentials = JSON.stringify({ user: agentName, password: config.password })

        let res = await fetch(`${serverUrl}/auth/login`, { method: "POST", headers, body: credentials })

        if (res.status === 404) {
            const reg = await fetch(`${serverUrl}/auth/register`, { method: "POST", headers, body: credentials })
            if (!reg.ok) {
                p.log.error(`Registration not allowed (${reg.status}). Ask the project owner to register "${agentName}".`)
                return
            }
            res = await fetch(`${serverUrl}/auth/login`, { method: "POST", headers, body: credentials })
        }

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
    const key = projectKey(serverUrl, process.cwd())
    const homeToken: HomeToken = {
        serverUrl,
        token,
        username: agentName,
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
