import * as p from "@clack/prompts"

const IDE_OPTIONS = [
    { value: "vscode", label: "VS Code" },
    { value: "antigravity", label: "Antigravity" },
]

const REMOTE_OPTIONS = [
    { value: "yes", label: "Yes — remote (WSL / SSH)" },
    { value: "no", label: "No — local machine" },
]

export async function askStartConfig(): Promise<{ ideType: string; remote: boolean } | null> {
    const ideType = await p.select({ message: "Editor", options: IDE_OPTIONS })
    if (p.isCancel(ideType)) return null

    const remoteAnswer = await p.select({
        message: "Is the editor running remotely? (e.g. VS Code Remote WSL/SSH)",
        options: REMOTE_OPTIONS,
    })
    if (p.isCancel(remoteAnswer)) return null

    return { ideType: ideType as string, remote: remoteAnswer === "yes" }
}
