import * as p from "@clack/prompts"
import os from "os"
import { assertTooltifyProject } from "./services/auth.service"
import { askMainAction } from "./ui/menus"
import { startCommand } from "./ui/commands/start.command"
import { stopCommand } from "./ui/commands/stop.command"
import { statusCommand } from "./ui/commands/status.command"
import { logsCommand } from "./ui/commands/logs.command"
import { resetPasswordCommand } from "./ui/commands/reset-password.command"

async function main() {
    const agentName = os.userInfo().username
    assertTooltifyProject()
    p.intro("Tooltify Agent Manager")

    const action = await askMainAction(agentName)
    if (p.isCancel(action)) {
        p.cancel("Operation cancelled")
        process.exit(0)
    }

    if (action === "start") await startCommand()
    if (action === "stop") stopCommand(agentName)
    if (action === "status") statusCommand()
    if (action === "logs") await logsCommand()
    if (action === "reset-password") await resetPasswordCommand(agentName)

    p.outro("Done")
}

main().catch((err) => {
    p.log.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
})
