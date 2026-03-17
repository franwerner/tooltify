import path from "path";

export function normalizePath(relPath: string): string {
    return relPath.split(/[/\\]/).filter(Boolean).join(path.sep);
}
