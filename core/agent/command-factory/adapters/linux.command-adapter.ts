
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

const IDE_SERVER_DIR: Record<IDEType, string> = {
    vscode: ".vscode-server",
    antigravity: ".antigravity-server",
}


class LinuxCommandAdapter implements ICommandAdapter {

    constructor(private ide: IDEType, private remote: boolean) { }

    private remoteCommand(gotoArg: string): string {
        /**
         * Solo aplica en linux, que es donde corre el server remoto (WSL/SSH).
         * Elige el socket IPC más reciente entre los que referencia un proceso del
         * server vivo: cada reload/reconexión deja sockets stale en /run/user, y
         * el más nuevo corresponde a la ventana actual. El binario remote-cli se
         * resuelve desde el install del server (no del /proc/exe del pid, que puede
         * ser un shell y dar una ruta inexistente, ni del PATH, que en spawn lazy
         * cae al code de Windows en /mnt/c con espacios).
         */
        const processName = IDE_PROCESS[this.ide]
        const ipcEnvVar = IDE_IPC_ENV[this.ide]
        const binary = IDE_BINARY[this.ide]
        const serverDir = IDE_SERVER_DIR[this.ide]

        return [
            `sock=""; newest=0;`,
            `for pid in $(pgrep -f "${processName}"); do`,
            `ipc=$(tr '\\0' '\\n' < /proc/$pid/environ 2>/dev/null | grep -m1 "^${ipcEnvVar}=" | cut -d= -f2);`,
            `[ -S "$ipc" ] || continue;`,
            `m=$(stat -c %Y "$ipc" 2>/dev/null || echo 0);`,
            `[ "$m" -gt "$newest" ] && { newest=$m; sock=$ipc; };`,
            `done;`,
            `bin=$(ls -t "$HOME/${serverDir}"/bin/*/bin/remote-cli/${binary} 2>/dev/null | head -1);`,
            `if [ -z "$sock" ] || [ -z "$bin" ]; then echo "tooltify: no active ${binary} window found" >&2; exit 1; fi;`,
            `${ipcEnvVar}="$sock" "$bin"${gotoArg};`,
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
