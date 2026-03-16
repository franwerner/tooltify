
import jwt from "jsonwebtoken"
import type { Server as SocketServer, Socket } from "socket.io"
import type { AgentCommand } from "#common/types/agent-ws.types"
import { TooltifyError } from "#common/errors/tooltify.error"
import type { VaultService } from "../../services/vault.service"

interface AgentTokenPayload {
    agentName: string
    hash: string
}

class AgentSocketServer {

    private agents = new Map<string, Socket>()

    constructor(io: SocketServer, private vault: VaultService, private secret: string) {
        const ns = io.of("/agent")
        ns.use((socket, next) => this.onAuth(socket, next))
        ns.on("connection", (socket) => this.onConnection(socket))
    }

    private onAuth(socket: Socket, next: (err?: Error) => void) {
        const { token } = socket.handshake.auth
        if (!token) return next(new Error("Missing token"))
        try {
            const payload = jwt.verify(token, this.secret) as AgentTokenPayload
            socket.data = { agentName: payload.agentName, hash: payload.hash }
            next()
        } catch {
            next(new Error("Invalid token"))
        }
    }

    private onConnection(socket: Socket) {
        const { agentName, hash } = socket.data
        this.agents.set(agentName, socket)
        this.vault.set(agentName, hash)
        console.log(`[agent:ws] connected: ${agentName}`)
        socket.on("disconnect", () => this.onDisconnect(agentName))
    }

    private onDisconnect(agentName: string) {
        this.vault.delete(agentName)
        this.agents.delete(agentName)
        console.log(`[agent:ws] disconnected: ${agentName}`)
    }

    send(agentName: string, command: AgentCommand): void {
        const socket = this.agents.get(agentName)
        if (!socket) throw new TooltifyError(`No agent connected for "${agentName}"`, "AGENT_NOT_CONNECTED")
        socket.emit("command", command)
    }

    getAll(): Map<string, Socket> {
        return this.agents
    }
}

function initAgentWs(io: SocketServer, vault: VaultService, secret: string): AgentSocketServer {
    return new AgentSocketServer(io, vault, secret)
}

export { initAgentWs, AgentSocketServer }
