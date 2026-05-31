import type { Server, Socket } from "socket.io"
import type { AuthService } from "../../services/auth.service"
import type { AgentCommand } from "#common/types/agent-ws.types"

export interface AgentHub {
  send(username: string, command: AgentCommand): boolean
  has(username: string): boolean
}

export class AgentSocketServer implements AgentHub {
  private connections = new Map<string, Socket>()

  constructor(io: Server, auth: AuthService) {
    const ns = io.of("/agents")

    ns.use((socket, next) => {
      const { token } = socket.handshake.auth
      if (!token) return next(new Error("Unauthorized"))
      const payload = auth.jwtVerify(token)
      if (!payload) return next(new Error("Unauthorized"))
      socket.data.user = payload.user
      next()
    })

    ns.on("connection", (socket) => {
      const username: string = socket.data.user
      this.connections.set(username, socket)
      console.log(`[agent-hub] agent connected — user="${username}"`)

      socket.on("disconnect", () => {
        this.connections.delete(username)
        console.log(`[agent-hub] agent disconnected — user="${username}"`)
      })
    })
  }

  send(username: string, command: AgentCommand): boolean {
    const socket = this.connections.get(username)
    if (!socket) return false
    socket.emit("command", command)
    return true
  }

  has(username: string): boolean {
    return this.connections.has(username)
  }

  getAll(): string[] {
    return Array.from(this.connections.keys())
  }
}
