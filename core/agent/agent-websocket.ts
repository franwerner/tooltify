
import http from "http"
import { Server as SocketServer, type Socket } from "socket.io"
import { exec } from "child_process"
import jwt from "jsonwebtoken"
import { CommandFactory, type IDEType, type ICommandAdapter } from "./command-factory"
import { CommandActions, type AgentCommand, type WebSocketResponse } from "./types/agent.types"

const VALID_ACTIONS = new Set(Object.values(CommandActions))

interface ServerAgentTokenPayload {
    kind: "server"
    serverId: string
    projectCwd: string
}

interface AgentServerOptions {
    port: number
    secret: string
    ideType: IDEType
    remote: boolean
}

class AgentServer {

    private commandAdapter: ICommandAdapter

    constructor(private opts: AgentServerOptions) {
        this.commandAdapter = CommandFactory.create({
            ide: opts.ideType,
            os: process.platform,
            remote: opts.remote,
        })
    }

    private reply<T = any>(socket: Socket, data: WebSocketResponse<T>) {
        const normalized: WebSocketResponse<T> = { ...data }
        if (data.error) normalized.status = "error"
        else if (!normalized.status) normalized.status = "success"
        socket.emit("response", normalized)
    }

    private onCommand(socket: Socket, msg: AgentCommand) {
        console.log(`[agent:cmd] action="${msg.action}" payload=${JSON.stringify(msg.payload)}`)

        if (!VALID_ACTIONS.has(msg.action)) {
            console.log(`[agent:cmd] unknown action "${msg.action}" — rejected`)
            this.reply(socket, { error: `Unknown action: ${msg.action}` })
            return
        }

        let command: string

        switch (msg.action) {
            case CommandActions.OPEN_EDITOR:
                command = this.commandAdapter.openEditor(msg.payload?.path)
                break
        }

        console.log(`[agent:exec] $ ${command}`)

        exec(command, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) {
                console.log(`[agent:exec] error — ${stderr || err.message}`)
                this.reply(socket, { error: stderr || err.message })
                return
            }
            console.log(`[agent:exec] ok — ${stdout.trim() || "(no output)"}`)
            this.reply(socket, { response: stdout.trim() })
        })
    }

    start() {
        const httpServer = http.createServer()
        const io = new SocketServer(httpServer, {
            cors: { origin: true },
        })

        io.use((socket, next) => {
            const { token } = socket.handshake.auth
            if (!token) return next(new Error("Missing token"))
            try {
                const payload = jwt.verify(token, this.opts.secret) as ServerAgentTokenPayload
                socket.data = payload
                next()
            } catch {
                console.log(`[agent:auth] rejected handshake — invalid token`)
                next(new Error("Unauthorized"))
            }
        })

        io.on("connection", (socket) => {
            const { serverId, projectCwd } = socket.data as ServerAgentTokenPayload
            console.log(`[agent:ws] server connected — serverId=${serverId} cwd=${projectCwd}`)
            socket.on("command", (msg: AgentCommand) => this.onCommand(socket, msg))
            socket.on("disconnect", (reason) => {
                console.log(`[agent:ws] server disconnected — serverId=${serverId} reason=${reason}`)
            })
        })

        httpServer.on("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE") {
                console.error(`[agent] port ${this.opts.port} already in use. To use a different port, change agentPort in ~/.tooltify/config.json`)
                process.exit(1)
            }
            throw err
        })

        httpServer.listen(this.opts.port, () => {
            console.log(`[agent] listening on port ${this.opts.port}`)
        })
    }
}

export { AgentServer, type AgentServerOptions }
