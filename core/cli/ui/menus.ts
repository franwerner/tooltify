import * as p from "@clack/prompts"

const MAIN_MENU_OPTIONS = [
    { value: "start", label: "Start agent ({{agentName}})" },
    { value: "stop", label: "Stop agent ({{agentName}})" },
    { value: "reset-password", label: "Reset password ({{agentName}})" },
    { value: "status", label: "View status" },
    { value: "logs", label: "View logs" },
]

function fill<V extends string>(
    options: Array<{ value: V; label: string }>,
    ctx: Record<string, string>,
): Array<{ value: V; label: string }> {
    return options.map((opt) => ({
        value: opt.value,
        label: opt.label.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? `{{${k}}}`),
    }))
}

export async function askMainAction(agentName: string): Promise<string | symbol> {
    return p.select({
        message: "What do you want to do?",
        options: fill(MAIN_MENU_OPTIONS, { agentName }),
    })
}
