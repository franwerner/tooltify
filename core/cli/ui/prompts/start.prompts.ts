import * as p from "@clack/prompts"

const IDE_OPTIONS = [
    { value: "vscode", label: "VS Code" },
    { value: "antigravity", label: "Antigravity" },
]

const REMOTE_OPTIONS = [
    { value: "yes", label: "Yes — remote (WSL / SSH)" },
    { value: "no", label: "No — local machine" },
]

export interface StartConfig {
    serverUrl: string
    ideType: string
    remote: boolean
    username: string
    password: string
}

export async function askStartConfig(): Promise<StartConfig | null> {
    const serverUrl = await p.text({
        message: "Server URL (e.g. http://localhost:41033)",
        placeholder: "http://localhost:41033",
        validate(value) {
            try { new URL(value) } catch { return "Enter a valid URL" }
        },
    })
    if (p.isCancel(serverUrl)) return null

    const username = await p.text({ message: "Username" })
    if (p.isCancel(username)) return null

    const password = await p.password({ message: "Password" })
    if (p.isCancel(password)) return null

    const ideType = await p.select({ message: "Editor", options: IDE_OPTIONS })
    if (p.isCancel(ideType)) return null

    const remoteAnswer = await p.select({
        message: "Is the editor running remotely? (e.g. VS Code Remote WSL/SSH)",
        options: REMOTE_OPTIONS,
    })
    if (p.isCancel(remoteAnswer)) return null

    return {
        serverUrl: serverUrl as string,
        ideType: ideType as string,
        remote: remoteAnswer === "yes",
        username: username as string,
        password: password as string,
    }
}
