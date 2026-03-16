
import { type IDEType } from "#common/types/ide.types"

const IDE_BINARY: Record<IDEType, string> = {
    vscode: "code",
    antigravity: "antigravity",
}

const IDE_GOTO_FLAG: Record<IDEType, string> = {
    vscode: "--goto",
    antigravity: "--goto",
}

export { IDE_BINARY, IDE_GOTO_FLAG }
