import type { Server as SocketServer, Socket, Namespace } from "socket.io"
import type { AuthService } from "../../services/auth.service"

function sessionMiddleware(auth: AuthService) {
    return (socket: Socket, next: (err?: Error) => void) => {
        const cookies = socket.handshake.headers.cookie || ""
        const match = cookies.match(/tooltify_session=([^;]+)/)
        const user = match ? auth.jwtVerify(match[1])?.user : null
        if (!user) return next(new Error("Not authenticated"))
        socket.data.user = user
        next()
    }
}

function initBuildWs(io: SocketServer, auth: AuthService): Namespace {
    const ns = io.of("/builds")
    ns.use(sessionMiddleware(auth))
    return ns
}

export { initBuildWs }
