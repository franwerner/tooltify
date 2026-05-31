import * as p from "@clack/prompts"
import os from "os"
import { getStatus } from "../../daemon/pid"
import { stopDaemon, startDaemon } from "../../daemon/lifecycle"
import { listTokens } from "#common/helpers/load-config.helper"
import { askPasswordAndConfirm } from "../prompts/auth.prompts"

async function promptPassword(label = ""): Promise<string | null> {
    const value = await p.password({ message: `Enter ${label}password` })
    if (p.isCancel(value)) return null
    return value as string
}

export async function resetPasswordCommand(agentName: string): Promise<void> {
    const tokens = listTokens()
    if (tokens.length === 0) {
        p.log.error("No server tokens found. Run 'start' first to connect to a server.")
        return
    }

    // If multiple servers are registered, use the first one with a matching username
    const token = tokens.find((t) => t.username === agentName) ?? tokens[0]

    const oldPassword = await promptPassword("current ")
    if (!oldPassword) return

    const result = await askPasswordAndConfirm("new ")
    if (!result) return

    // Authenticate with old password to obtain a session token for the register call
    let sessionToken: string
    try {
        const loginRes = await fetch(`${token.serverUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: agentName, password: oldPassword }),
        })
        if (!loginRes.ok) {
            const body = await loginRes.json().catch(() => ({})) as Record<string, unknown>
            p.log.error(`Authentication failed: ${(body as any).message ?? loginRes.status}`)
            return
        }
        const body = await loginRes.json() as { data: { token: string } }
        sessionToken = body.data.token
    } catch (err) {
        p.log.error(`Could not reach server: ${err instanceof Error ? err.message : String(err)}`)
        return
    }

    // Re-register (upsert) with the new password using the session cookie
    try {
        const registerRes = await fetch(`${token.serverUrl}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `tooltify_session=${sessionToken}`,
            },
            body: JSON.stringify({ user: agentName, password: result.password }),
        })
        if (!registerRes.ok) {
            const body = await registerRes.json().catch(() => ({})) as Record<string, unknown>
            p.log.error(`Password reset failed: ${(body as any).message ?? registerRes.status}`)
            return
        }
    } catch (err) {
        p.log.error(`Could not reach server: ${err instanceof Error ? err.message : String(err)}`)
        return
    }

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
