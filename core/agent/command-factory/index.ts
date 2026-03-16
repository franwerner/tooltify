
import { type IDEType, type ICommandAdapter } from "../types/CommandAdapter.interface"
import { LinuxCommandAdapter } from "./adapters/linux.command-adapter"
import { WindowsCommandAdapter } from "./adapters/windows.command-adapter"
import { DarwinCommandAdapter } from "./adapters/darwin.command-adapter"

interface CommandFactoryOptions {
    ide: IDEType
    os: string
    remote: boolean
}

type OSAdapterCtor = new (ide: IDEType, remote: boolean) => ICommandAdapter

const OS_ADAPTERS: Record<string, OSAdapterCtor> = {
    linux: LinuxCommandAdapter,
    win32: WindowsCommandAdapter,
    darwin: DarwinCommandAdapter,
}

class CommandFactory {
    static create({ ide, os, remote }: CommandFactoryOptions): ICommandAdapter {
        const Adapter = OS_ADAPTERS[os]
        if (!Adapter) throw new Error(`Unsupported OS: ${os}`)
        return new Adapter(ide, remote)
    }
}

export { CommandFactory, type IDEType, type ICommandAdapter }
