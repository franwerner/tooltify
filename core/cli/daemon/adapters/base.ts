
interface DaemonOptions {
    agentEntry: string
    cwd: string
    logFile: string
    env: Record<string, string>
}

interface IDaemonAdapter {
    start(options: DaemonOptions): number
    getAgentDir(): string
    getCredentialsPath(): string
}

export { type IDaemonAdapter, type DaemonOptions }
