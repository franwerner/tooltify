
import { type IDEType, type ICommandAdapter } from "../../types/CommandAdapter.interface"
import { IDE_BINARY, IDE_GOTO_FLAG } from "../const/ide-binary"

class WindowsCommandAdapter implements ICommandAdapter {

    constructor(private ide: IDEType, private remote: boolean) { }

    openEditor(targetPath?: string): string {
        const binary = IDE_BINARY[this.ide]
        const gotoFlag = IDE_GOTO_FLAG[this.ide]
        const pathArg = targetPath ? ` ${gotoFlag} "${targetPath}"` : ""
        return `${binary}${pathArg}`
    }
}

export { WindowsCommandAdapter }
