import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { AgentSocketServer } from "../presentation/ws/agent";
import { CommandActions, type AgentCommand } from "#common/types/agent-ws.types";
import { TooltifyError } from "#common/errors/tooltify.error";
import { normalizePath } from "#common/utils/normalizedPath"

export class EditorService {
  constructor(
    private basePath: string,
    private agentWs: AgentSocketServer,
  ) { }

  getRoot(): string {
    return this.basePath.replace(/\\/g, "/");
  }

  resolvePath(relPath: string): string {
    const normalized = normalizePath(relPath);
    const fullPath = path.resolve(this.basePath, normalized);
    /**
     * Se agrega path.sep al final de basePath para una verificación correcta
     *
     * Sin path.sep (incorrecto):
     *   basePath = "C:/Users/.../playground/src"
     *   fullPath = "C:/Users/.../playground/src-private/secrets.ts"  ← resuelto desde traversal
     *   fullPath.startsWith(basePath) → true ✗ (falso positivo, "src-private" empieza con "src")
     */
    if (!fullPath.startsWith(this.basePath + path.sep)) throw new TooltifyError("Path is outside packagesDir", "INVALID_PATH", 403);
    return fullPath;
  }

  read(relPath: string) {
    const fullPath = this.resolvePath(relPath);
    try {
      const content = readFileSync(fullPath, "utf-8");
      const ext = path.extname(fullPath).slice(1);
      return { content, ext, path: relPath };
    } catch {
      throw new TooltifyError("File not found", "FILE_NOT_FOUND", 404);
    }
  }

  save(relPath: string, content: string, sessionUser?: string) {
    const fullPath = this.resolvePath(relPath);
    try {
      writeFileSync(fullPath, content);
      return { written: Buffer.byteLength(content), fullPath, user: sessionUser };
    } catch (e: any) {
      throw new TooltifyError(e.message, "WRITE_ERROR", 500);
    }
  }

  openSource(source: string, username: string) {
    const match = source.match(/^(.+):(\d+)$/);
    const relPath = match ? match[1] : source;
    const line = match ? match[2] : null;

    const fullPath = this.resolvePath(relPath);
    const target = line ? `${fullPath}:${line}` : fullPath;

    const command: AgentCommand = {
      action: CommandActions.OPEN_EDITOR,
      payload: { path: target },
    };

    this.agentWs.send(username, command);

    return { opened: target };
  }
}
