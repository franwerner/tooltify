import { Server as SocketServer } from "socket.io"
import type { Server } from "http"
import type { AuthService } from "../../services/auth.service"
import { initBuildWs } from "./build"
import { AgentSocketServer } from "./agent"
import type { AgentHub } from "./agent"

export function initAgentWs(io: SocketServer, auth: AuthService): AgentSocketServer {
    return new AgentSocketServer(io, auth)
}

export function initSocket(httpServer: Server, auth: AuthService): { io: SocketServer; buildsNs: ReturnType<typeof initBuildWs>; agentHub: AgentHub } {
    const io = new SocketServer(httpServer, {
        cors: { origin: true, credentials: true },
    })

    const buildsNs = initBuildWs(io, auth)
    const agentHub = initAgentWs(io, auth)

    return { io, buildsNs, agentHub }
}
