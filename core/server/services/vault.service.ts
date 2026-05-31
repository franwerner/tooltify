
import crypto from "crypto"

interface VaultEntry {
    hash: string
    fp: string
}

class VaultService {
    private store = new Map<string, VaultEntry>()
    private writeback?: (users: Map<string, { hash: string }>) => void

    constructor(private secret: string, writeback?: (users: Map<string, { hash: string }>) => void) {
        this.writeback = writeback
    }

    set(agentName: string, hash: string): void {
        const fp = crypto.createHash("sha256").update(hash + this.secret).digest("hex")
        this.store.set(agentName, { hash, fp })
        this.flushWriteback()
    }

    get(agentName: string): VaultEntry | undefined {
        return this.store.get(agentName)
    }

    delete(agentName: string): void {
        this.store.delete(agentName)
        this.flushWriteback()
    }

    keys(): string[] {
        return Array.from(this.store.keys())
    }

    private flushWriteback(): void {
        if (!this.writeback) return
        const users = new Map(
            Array.from(this.store.entries()).map(([k, v]) => [k, { hash: v.hash }])
        )
        this.writeback(users)
    }
}

export { VaultService }
