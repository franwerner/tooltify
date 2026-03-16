
enum CommandActions {
    OPEN_EDITOR = "OPEN_EDITOR",
}

interface AgentSubscription {
    agentName: string
    hash: string
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

export { CommandActions, type AgentSubscription, type AgentCommand, type WebSocketResponse }
