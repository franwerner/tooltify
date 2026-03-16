
import { type IDEType, type ICommandAdapter } from "../../types/CommandAdapter.interface"
import { IDE_BINARY, IDE_GOTO_FLAG } from "../const/ide-binary"

const IDE_PROCESS: Record<IDEType, string> = {
    vscode: "vscode-server",
    antigravity: "antigravity-server",
}

const IDE_IPC_ENV: Record<IDEType, string> = {
    vscode: "VSCODE_IPC_HOOK_CLI",
    antigravity: "ANTIGRAVITY_IPC_HOOK",
}


class LinuxCommandAdapter implements ICommandAdapter {

    constructor(private ide: IDEType, private remote: boolean) { }

    private discoverIpc(): string {
        /**
         * Solo es algo que se hacen linux, ya que solo esta preparado para servidor remotos dentro de linux (o en la pratica es lo mas comun).
         */
        const processName = IDE_PROCESS[this.ide]
        const ipcEnvVar = IDE_IPC_ENV[this.ide]

        const findPids = `pgrep -f "${processName}"`
        const readEnv = `cat /proc/$pid/environ 2>/dev/null | tr '\\0' '\\n'`
        const extractVar = `grep -m1 "^${ipcEnvVar}=" | cut -d= -f2`
        const loop = `for pid in $(${findPids}); do val=$(${readEnv} | ${extractVar}); [ -n "$val" ] && echo "$val" && break; done`

        return `$(${loop})`
    }

    openEditor(targetPath?: string): string {
        const binary = IDE_BINARY[this.ide]
        const gotoFlag = IDE_GOTO_FLAG[this.ide]
        const pathArg = targetPath ? ` ${gotoFlag} "${targetPath}"` : ""
        const whichBinary = `$(which ${binary})${pathArg}`
        if (this.remote) {
            const ipcEnvVar = IDE_IPC_ENV[this.ide]
            const ipc = this.discoverIpc()
            return `${ipcEnvVar}=${ipc} ${whichBinary}`
        }
        return whichBinary
    }
}

export { LinuxCommandAdapter }
