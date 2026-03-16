
import { type IDEType } from "#common/types/ide.types"

interface ICommandAdapter {
    openEditor(targetPath?: string): string
}

export { type IDEType, type ICommandAdapter }
