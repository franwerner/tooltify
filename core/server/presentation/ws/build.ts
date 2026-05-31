import type { Server as SocketServer, Socket, Namespace } from "socket.io"
import type { AuthService } from "../../services/auth.service"

function sessionMiddleware(auth: AuthService, cookieName: string) {
    const cookieRegex = new RegExp(`${cookieName}=([^;]+)`)
    return (socket: Socket, next: (err?: Error) => void) => {
        const cookies = socket.handshake.headers.cookie || ""
        const match = cookies.match(cookieRegex)
        const user = match ? auth.jwtVerify(match[1])?.user : null
        if (!user) return next(new Error("Not authenticated"))
        socket.data.user = user
        next()
    }
}

function initBuildWs(io: SocketServer, auth: AuthService, cookieName: string): Namespace {
    const ns = io.of("/builds")
    ns.use(sessionMiddleware(auth, cookieName))
    return ns
}

export { initBuildWs }
