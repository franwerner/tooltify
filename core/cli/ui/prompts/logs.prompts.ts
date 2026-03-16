import * as p from "@clack/prompts"

export async function askSelectAgent(agents: string[]): Promise<string | null> {
    const agentName = await p.select<string>({
        message: "Select agent",
        options: agents.map((a) => ({ value: a, label: a })),
    })
    if (p.isCancel(agentName)) return null
    return agentName as string
}
