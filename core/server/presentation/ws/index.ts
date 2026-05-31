import { Server as SocketServer } from "socket.io"
import type { Server } from "http"
import type { AuthService } from "../../services/auth.service"
import { initBuildWs } from "./build"

export function initSocket(httpServer: Server, auth: AuthService) {
    const io = new SocketServer(httpServer, {
        cors: { origin: true, credentials: true },
    })

    const buildsNs = initBuildWs(io, auth)

    return { io, buildsNs }
}
