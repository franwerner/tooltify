
import { io, type Socket } from "socket.io-client"
import { exec } from "child_process"
import { CommandFactory, type IDEType, type ICommandAdapter } from "./command-factory"
import { CommandActions, type AgentCommand, type WebSocketResponse } from "./types/agent.types"

const VALID_ACTIONS = new Set(Object.values(CommandActions))

interface AgentWebsocketOptions {
    agentName: string
    port: number
    ideType: IDEType
    remote: boolean
    hash: string
}

class AgentWebsocket {

    private socket!: Socket
    private commandAdapter: ICommandAdapter
    private agentName: string
    private port: number
    private hash: string

    constructor({ agentName, port, ideType, remote, hash }: AgentWebsocketOptions) {
        this.agentName = agentName
        this.port = port
        this.hash = hash
        this.commandAdapter = CommandFactory.create({
            ide: ideType,
            os: process.platform,
            remote,
        })
    }

    private send<T = any>(data: WebSocketResponse<T>) {
        const normalized: WebSocketResponse<T> = { ...data }
        if (data.error) normalized.status = "error"
        else if (!normalized.status) normalized.status = "success"
        this.socket.emit("response", normalized)
    }

    private onConnectError(e: Error) {
        console.log(`[agent:ws] error — ${e.message}`)
    }

    private onConnect() {
        console.log(`[agent:ws] connected — subscribed as "${this.agentName}"`)
    }

    private onCommand(msg: AgentCommand) {
        console.log(`[agent:cmd] action="${msg.action}" payload=${JSON.stringify(msg.payload)}`)

        if (!VALID_ACTIONS.has(msg.action)) {
            console.log(`[agent:cmd] unknown action "${msg.action}" — rejected`)
            this.send({ error: `Unknown action: ${msg.action}` })
            return
        }

        let command: string

        switch (msg.action) {
            case CommandActions.OPEN_EDITOR:
                command = this.commandAdapter.openEditor(msg.payload?.path)
                break
        }

        console.log(`[agent:exec] $ ${command}`)

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(`[agent:exec] error — ${stderr || err.message}`)
                this.send({ error: stderr || err.message })
                return
            }
            console.log(`[agent:exec] ok — ${stdout.trim() || "(no output)"}`)
            this.send({ response: stdout.trim() })
        })
    }

    private onDisconnect(reason: string) {
        console.log(`[agent:ws] disconnected — ${reason}`)
    }

    private connect() {
        this.socket = io(`http://localhost:${this.port}/agent`, {
            auth: { agentName: this.agentName, hash: this.hash },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 60000,
        })

        this.socket.on("connect_error", (e) => this.onConnectError(e))
        this.socket.on("connect", () => this.onConnect())
        this.socket.on("command", (msg) => this.onCommand(msg))
        this.socket.on("disconnect", (reason) => this.onDisconnect(reason))
    }

    start() {
        this.connect()
    }
}

export { AgentWebsocket, type AgentWebsocketOptions }
