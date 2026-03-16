import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { AgentSocketServer } from "../presentation/ws/agent";
import { CommandActions, type AgentCommand } from "#common/types/agent-ws.types";
import { TooltifyError } from "#common/errors/tooltify.error";

const LANG_MAP: Record<string, string> = {
  ts: "typescript", tsx: "typescript",
  js: "javascript", jsx: "javascript",
  css: "css", json: "json", graphql: "graphql",
  md: "markdown", html: "html", scss: "scss", less: "less",
};

export class EditorService {
  constructor(
    private basePath: string,
    private agentWs: AgentSocketServer,
  ) { }

  resolvePath(relPath: string): string {
    const normalized = relPath.startsWith("/") ? relPath.slice(1) : relPath;
    const fullPath = path.resolve(this.basePath, normalized);
    if (!fullPath.startsWith(this.basePath)) throw new TooltifyError("Path is outside packagesDir", "INVALID_PATH", 403);
    return fullPath;
  }

  read(relPath: string) {
    const fullPath = this.resolvePath(relPath);
    try {
      const content = readFileSync(fullPath, "utf-8");
      const ext = path.extname(fullPath).slice(1);
      return { content, lang: LANG_MAP[ext] || "plaintext", path: relPath };
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
