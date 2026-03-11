import { readFileSync, readdirSync, statSync } from "fs";
import { execFile } from "child_process";
import type { EditorService } from "./editor.service";

export class TrackerService {
  constructor(private editor: EditorService) { }

  openSource(source: string, username: string) {
    const match = source.match(/^(.+):(\d+)$/);
    const relPath = match ? match[1] : source;
    const line = match ? match[2] : null;

    const fullPath = this.editor.resolvePath(relPath);
    if (!fullPath) return { ok: false, error: "Invalid path" };

    return this.openInVscode(fullPath, line, username);
  }

  private openInVscode(filePath: string, line: string | null, username: string) {
    try {
      const passwd = readFileSync("/etc/passwd", "utf-8");
      const entry = passwd.split("\n").find((l) => l.split(":")[0] === username);
      if (!entry) return { ok: false, error: `User "${username}" not found` };
      const uid = entry.split(":")[2];
      const homeDir = entry.split(":")[5];

      const socket = this.findSocket(uid);
      if (!socket) return { ok: false, error: `No VS Code IPC socket for ${username}` };

      const codeBin = this.findCodeBin(homeDir);
      if (!codeBin) return { ok: false, error: `No VS Code CLI found for ${username}` };

      const target = line ? `${filePath}:${line}` : filePath;
      execFile(codeBin, ["--goto", target], {
        env: { ...process.env, VSCODE_IPC_HOOK_CLI: socket },
      });

      return { ok: true, opened: target };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  private findSocket(uid: string): string | null {
    const dir = `/run/user/${uid}`;
    try {
      return readdirSync(dir)
        .filter((f) => f.startsWith("vscode-ipc-") && f.endsWith(".sock"))
        .map((f) => ({ name: f, mtime: statSync(`${dir}/${f}`).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)
        .map((f) => `${dir}/${f.name}`)[0] || null;
    } catch {
      return null;
    }
  }

  private findCodeBin(homeDir: string): string | null {
    const serversDir = `${homeDir}/.vscode-server/cli/servers`;
    try {
      const servers = readdirSync(serversDir)
        .filter((d) => d.startsWith("Stable-"))
        .map((d) => ({ name: d, mtime: statSync(`${serversDir}/${d}`).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      if (servers.length === 0) return null;
      return `${serversDir}/${servers[0].name}/server/bin/remote-cli/code`;
    } catch {
      return null;
    }
  }

}
