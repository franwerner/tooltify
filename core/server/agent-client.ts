import { io, type Socket } from "socket.io-client"
import type { AgentCommand } from "#common/types/agent-ws.types"

interface AgentClientOptions {
    port: number
    token: string
    spawnIfDown: () => void
}

class AgentClient {

    private socket: Socket
    private spawnAttempted = false

    constructor(private opts: AgentClientOptions) {
        this.socket = io(`http://localhost:${opts.port}`, {
            auth: { token: opts.token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
        })

        this.socket.on("connect", () => {
            this.spawnAttempted = false
            console.log(`[server:agent-client] connected to agent on port ${opts.port}`)
        })

        this.socket.on("connect_error", (err) => {
            console.log(`[server:agent-client] connect error — ${err.message}`)
            if (!this.spawnAttempted) {
                this.spawnAttempted = true
                opts.spawnIfDown()
            }
        })

        this.socket.on("disconnect", (reason) => {
            console.log(`[server:agent-client] disconnected — ${reason}`)
        })

        this.socket.on("response", (data: unknown) => {
            console.log(`[server:agent-client] response — ${JSON.stringify(data)}`)
        })
    }

    connect(): void {
        if (!this.socket.connected) {
            this.socket.connect()
        }
    }

    send(username: string, command: AgentCommand): void {
        if (!this.socket.connected) {
            console.log(`[server:agent-client] agent not connected — dropping command for user "${username}"`)
            return
        }
        this.socket.emit("command", command)
    }
}

export { AgentClient, type AgentClientOptions }
