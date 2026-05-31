
import { io, type Socket } from "socket.io-client"
import { exec } from "child_process"
import { CommandFactory, type IDEType } from "./command-factory/index"
import { CommandActions, type AgentCommand, type WebSocketResponse } from "./types/agent.types"

const VALID_ACTIONS = new Set(Object.values(CommandActions))

interface AgentClientOptions {
    serverUrl: string
    token: string
    ideType: IDEType
    remote: boolean
}

class AgentClient {

    private socket: Socket
    private serverUrl: string

    constructor(private opts: AgentClientOptions) {
        this.serverUrl = opts.serverUrl

        this.socket = io(`${opts.serverUrl}/agents`, {
            auth: { token: opts.token },
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 30000,
        })

        this.socket.on("connect", () => {
            console.log(`[agent:ws] connected — server=${this.serverUrl}`)
        })

        this.socket.on("connect_error", (err) => {
            // Stop reconnecting on auth rejection; other errors keep the built-in backoff
            if (err.message === "Unauthorized" || err.message.startsWith("401")) {
                console.error(`[agent:ws] auth rejected by ${this.serverUrl} — stopping reconnect`)
                this.socket.disconnect()
            } else {
                console.error(`[agent:ws] connect error — ${this.serverUrl}: ${err.message}`)
            }
        })

        this.socket.on("disconnect", (reason) => {
            console.log(`[agent:ws] disconnected — server=${this.serverUrl} reason=${reason}`)
        })

        const commandAdapter = CommandFactory.create({
            ide: opts.ideType,
            os: process.platform,
            remote: opts.remote,
        })

        this.socket.on("command", (msg: AgentCommand) => {
            console.log(`[agent:cmd] action="${msg.action}" payload=${JSON.stringify(msg.payload)}`)

            if (!VALID_ACTIONS.has(msg.action)) {
                console.log(`[agent:cmd] unknown action "${msg.action}" — rejected`)
                this.reply({ error: `Unknown action: ${msg.action}` })
                return
            }

            let command: string

            switch (msg.action) {
                case CommandActions.OPEN_EDITOR:
                    command = commandAdapter.openEditor(msg.payload?.path)
                    break
            }

            console.log(`[agent:exec] $ ${command}`)

            exec(command, { windowsHide: true }, (err, stdout, stderr) => {
                if (err) {
                    console.log(`[agent:exec] error — ${stderr || err.message}`)
                    this.reply({ error: stderr || err.message })
                    return
                }
                console.log(`[agent:exec] ok — ${stdout.trim() || "(no output)"}`)
                this.reply({ response: stdout.trim() })
            })
        })
    }

    private reply<T = any>(data: WebSocketResponse<T>) {
        const normalized: WebSocketResponse<T> = { ...data }
        if (data.error) normalized.status = "error"
        else if (!normalized.status) normalized.status = "success"
        this.socket.emit("response", normalized)
    }

    disconnect() {
        this.socket.disconnect()
    }
}

export { AgentClient, type AgentClientOptions }
