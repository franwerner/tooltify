import fs from "fs"

export function readLogSnapshot(logFile: string): string {
    return fs.readFileSync(logFile, "utf-8")
}

export function logFileExists(logFile: string): boolean {
    return fs.existsSync(logFile)
}

export function tailLog(logFile: string, onChunk: (chunk: string) => void): () => void {
    let size = fs.statSync(logFile).size

    fs.watchFile(logFile, { interval: 500 }, (curr) => {
        if (curr.size > size) {
            const fd = fs.openSync(logFile, "r")
            const buf = Buffer.alloc(curr.size - size)
            fs.readSync(fd, buf, 0, buf.length, size)
            fs.closeSync(fd)
            onChunk(buf.toString("utf-8"))
            size = curr.size
        }
    })

    return () => fs.unwatchFile(logFile)
}
