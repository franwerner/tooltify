
import crypto from "crypto"

interface VaultEntry {
    hash: string
    fp: string
}

class VaultService {
    private store = new Map<string, VaultEntry>()

    constructor(private secret: string) {}

    set(agentName: string, hash: string): void {
        const fp = crypto.createHash("sha256").update(hash + this.secret).digest("hex")
        this.store.set(agentName, { hash, fp })
    }

    get(agentName: string): VaultEntry | undefined {
        return this.store.get(agentName)
    }

    delete(agentName: string): void {
        this.store.delete(agentName)
    }

    keys(): string[] {
        return Array.from(this.store.keys())
    }
}

export { VaultService }
