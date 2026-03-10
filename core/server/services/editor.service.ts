import { readFileSync, writeFileSync } from "fs";
import path from "path";

const LANG_MAP: Record<string, string> = {
  ts: "typescript", tsx: "typescript",
  js: "javascript", jsx: "javascript",
  css: "css", json: "json", graphql: "graphql",
  md: "markdown", html: "html", scss: "scss", less: "less",
};

export class EditorService {
  constructor(private basePath: string) {}

  resolvePath(relPath: string): string | null {
    const fullPath = path.resolve(this.basePath, relPath);
    if (!fullPath.startsWith(this.basePath) || fullPath.includes("node_modules")) return null;
    return fullPath;
  }

  read(relPath: string) {
    const fullPath = this.resolvePath(relPath);
    if (!fullPath) return { ok: false as const, error: "Access denied" };
    try {
      const content = readFileSync(fullPath, "utf-8");
      const ext = path.extname(fullPath).slice(1);
      return { ok: true as const, content, lang: LANG_MAP[ext] || "plaintext", path: relPath };
    } catch {
      return { ok: false as const, error: "File not found" };
    }
  }

  save(relPath: string, content: string, sessionUser?: string) {
    const fullPath = this.resolvePath(relPath);
    if (!fullPath) return { ok: false as const, error: "Access denied" };
    try {
      writeFileSync(fullPath, content);
      return { ok: true as const, written: Buffer.byteLength(content), fullPath, user: sessionUser };
    } catch (e: any) {
      return { ok: false as const, error: e.message };
    }
  }
}
