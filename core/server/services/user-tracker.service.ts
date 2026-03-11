import { readFileSync } from "fs";
import { spawn, type ChildProcess } from "child_process";

export class UserTrackerService {
  private fatraceProc: ChildProcess | null = null;
  private recentWrites = new Map<string, string>();
  private webWrites = new Map<string, string>();
  private pidUserCache = new Map<string, string>();

  constructor(private pathFilter: string) { }

  start() {
    // this.fatraceProc = spawn("fatrace", ["-f", "W"], {
    //   stdio: ["ignore", "pipe", "ignore"],
    // });

    // this.fatraceProc.stdout!.on("data", (data: Buffer) => {
    //   for (const line of data.toString().split("\n")) {
    //     if (!line.includes(this.pathFilter)) continue;
    //     const m = line.match(/\((\d+)\):\s+C?W\s+(.+)/);
    //     if (m) {
    //       const user = this.resolveUser(m[1]) || "unknown";
    //       this.recentWrites.set(m[2].trim(), user);
    //     }
    //   }
    // });
  }

  shutdown() {
    this.fatraceProc?.kill();
  }

  registerWebWrite(fullPath: string, user: string) {
    this.webWrites.set(fullPath, user);
  }

  resolveFileAuthor(file: string): string {
    const user =
      this.webWrites.get(file) ||
      this.recentWrites.get(file) ||
      "unknown";
    this.webWrites.delete(file);
    this.recentWrites.delete(file);
    return user;
  }

  private resolveUser(pid: string): string | null {
    if (this.pidUserCache.has(pid)) return this.pidUserCache.get(pid)!;
    try {
      const uid = parseInt(readFileSync(`/proc/${pid}/loginuid`, "utf-8").trim());
      if (uid >= 0 && uid < 65534) {
        const line = readFileSync("/etc/passwd", "utf-8")
          .split("\n")
          .find((l) => l.split(":")[2] === String(uid));
        const user = line ? line.split(":")[0] : `uid:${uid}`;
        this.pidUserCache.set(pid, user);
        return user;
      }
    } catch { }
    return null;
  }
}
