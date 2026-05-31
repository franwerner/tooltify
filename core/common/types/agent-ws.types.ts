
enum CommandActions {
    OPEN_EDITOR = "OPEN_EDITOR",
}

interface AgentCommand {
    action: CommandActions
    payload?: {
        path?: string
    }
}

interface WebSocketResponse<T = any> {
    status?: "error" | "success"
    error?: string
    response?: T
}

export { CommandActions, type AgentCommand, type WebSocketResponse }
