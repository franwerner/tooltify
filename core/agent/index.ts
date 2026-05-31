
import os from "os"
import fs from "fs"
import path from "path"
import { loadGlobalConfig, homeTokensDir, listTokens, projectKey, type HomeToken } from "#common/helpers/load-config.helper"
import { AgentClient } from "./agent-websocket"

const globalConfig = loadGlobalConfig()
const { ideType, remote } = globalConfig
const agentName = os.userInfo().username

console.log(`[agent] starting as "${agentName}"`)

const pool = new Map<string, AgentClient>()

function keyFor(token: HomeToken): string {
    return projectKey(token.serverUrl, token.projectCwd)
}

function connect(token: HomeToken): void {
    const key = keyFor(token)
    if (pool.has(key)) return
    console.log(`[agent] connecting — server=${token.serverUrl} cwd=${token.projectCwd}`)
    const client = new AgentClient({ serverUrl: token.serverUrl, token: token.token, ideType, remote })
    pool.set(key, client)
}

function disconnect(key: string): void {
    const client = pool.get(key)
    if (!client) return
    console.log(`[agent] disconnecting — key=${key}`)
    client.disconnect()
    pool.delete(key)
}

// Initial scan — connect to every known server
listTokens().forEach(connect)

const tokensDir = homeTokensDir()

// fs.watch is unreliable on WSL2 and network mounts (inotify events may not fire).
// A polling fallback runs every POLL_INTERVAL_MS to catch missed events.
const POLL_INTERVAL_MS = 10_000

function syncTokenDir(): void {
    const currentKeys = new Set<string>()

    // Connect any newly added tokens
    try {
        const files = fs.readdirSync(tokensDir).filter((f) => f.endsWith(".json"))
        for (const file of files) {
            try {
                const raw = fs.readFileSync(path.join(tokensDir, file), "utf-8")
                const token = JSON.parse(raw) as HomeToken
                const key = keyFor(token)
                currentKeys.add(key)
                connect(token)
            } catch {
                // Malformed or partially-written file; skip
            }
        }
    } catch {
        // Tokens dir does not exist yet
    }

    // Disconnect tokens whose files were removed
    for (const key of pool.keys()) {
        if (!currentKeys.has(key)) {
            disconnect(key)
        }
    }
}

// Watch for file-system events as the primary notification mechanism
try {
    fs.watch(tokensDir, { persistent: true }, (_event, filename) => {
        if (!filename || !filename.endsWith(".json")) return
        syncTokenDir()
    })
    console.log(`[agent] watching tokens dir: ${tokensDir}`)
} catch {
    // Dir may not exist on first run; polling will cover it until tokens appear
    console.log(`[agent] tokens dir not found — relying on polling: ${tokensDir}`)
}

// Polling fallback: catches events missed by fs.watch on WSL2/network mounts
setInterval(syncTokenDir, POLL_INTERVAL_MS)
