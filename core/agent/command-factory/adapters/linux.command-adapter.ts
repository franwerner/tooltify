
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

    private remoteCommand(gotoArg: string): string {
        /**
         * Solo aplica en linux, que es donde corre el server remoto (WSL/SSH).
         * El binario del remote-cli se resuelve desde el mismo proceso del que se
         * extrae el IPC (vía /proc/$pid/exe) para atarlo a la versión del server
         * en ejecución, en vez de depender del PATH: con el spawn lazy desde el
         * bundler, `which` cae al code de Windows en /mnt/c (path con espacios).
         */
        const processName = IDE_PROCESS[this.ide]
        const ipcEnvVar = IDE_IPC_ENV[this.ide]
        const binary = IDE_BINARY[this.ide]

        return [
            `for pid in $(pgrep -f "${processName}"); do`,
            `ipc=$(cat /proc/$pid/environ 2>/dev/null | tr '\\0' '\\n' | grep -m1 "^${ipcEnvVar}=" | cut -d= -f2);`,
            `[ -n "$ipc" ] || continue;`,
            `bin="$(dirname "$(readlink /proc/$pid/exe)")/bin/remote-cli/${binary}";`,
            `${ipcEnvVar}="$ipc" "$bin"${gotoArg};`,
            `break;`,
            `done`,
        ].join(" ")
    }

    openEditor(targetPath?: string): string {
        const binary = IDE_BINARY[this.ide]
        const gotoFlag = IDE_GOTO_FLAG[this.ide]
        const gotoArg = targetPath ? ` ${gotoFlag} "${targetPath}"` : ""
        if (this.remote) {
            return this.remoteCommand(gotoArg)
        }
        return `"$(which ${binary})"${gotoArg}`
    }
}

export { LinuxCommandAdapter }
