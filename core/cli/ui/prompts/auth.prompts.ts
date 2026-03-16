import * as p from "@clack/prompts"

export async function askPasswordAndConfirm(label = ""): Promise<{ password: string } | null> {
    const password = await p.password({ message: `Enter ${label}password` })
    if (p.isCancel(password)) return null

    const confirm = await p.password({ message: `Confirm ${label}password` })
    if (p.isCancel(confirm)) return null

    if (password !== confirm) {
        p.log.error("Passwords do not match")
        return null
    }

    return { password }
}
