import { Server as SocketServer } from "socket.io"
import type { Server } from "http"
import type { AuthService } from "../../services/auth.service"
import type { VaultService } from "../../services/vault.service"
import { initAgentWs } from "./agent"
import { initBuildWs } from "./build"

export function initSocket(httpServer: Server, auth: AuthService, vault: VaultService) {
    const io = new SocketServer(httpServer, {
        cors: { origin: true, credentials: true },
    })

    const agentWs = initAgentWs(io, vault)
    const buildsNs = initBuildWs(io, auth)

    return { io, agentWs, buildsNs }
}
