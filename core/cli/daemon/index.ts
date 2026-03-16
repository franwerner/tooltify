
import { type IDaemonAdapter } from "./adapters/base"
import { LinuxDaemonAdapter } from "./adapters/linux.daemon-adapter"
import { DarwinDaemonAdapter } from "./adapters/darwin.daemon-adapter"
import { WindowsDaemonAdapter } from "./adapters/windows.daemon-adapter"

type DaemonAdapterCtor = new () => IDaemonAdapter

const OS_DAEMON_ADAPTERS: Record<string, DaemonAdapterCtor> = {
    linux: LinuxDaemonAdapter,
    darwin: DarwinDaemonAdapter,
    win32: WindowsDaemonAdapter,
}

class DaemonFactory {
    static create(os: string): IDaemonAdapter {
        const Adapter = OS_DAEMON_ADAPTERS[os]
        if (!Adapter) throw new Error(`Unsupported OS: ${os}`)
        return new Adapter()
    }
}

const DaemonAdapter = DaemonFactory.create(process.platform)
export { DaemonFactory, DaemonAdapter }
