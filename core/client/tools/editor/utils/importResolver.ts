import { apiJson } from "../../../shared/utils/serverUrl"

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"]
const INDEX_FILES = EXTENSIONS.map((ext) => `/index${ext}`)

type AliasMap = Record<string, string>

export function getAliases(): AliasMap {
    return (window as any).__ERXES_ALIASES__ || {}
}

export function resolveImport(specifier: string, fromFile: string): string | null {
    const fromDir = fromFile.replace(/\/[^/]+$/, "")

    if (specifier.startsWith(".")) {
        const parts = (fromDir + "/" + specifier).split("/")
        const resolved: string[] = []
        for (const p of parts) {
            if (p === "." || p === "") continue
            if (p === "..") { resolved.pop(); continue }
            resolved.push(p)
        }
        return resolved.join("/")
    }

    const aliases = getAliases()
    const sorted = Object.keys(aliases).sort((a, b) => b.length - a.length)

    for (const alias of sorted) {
        const isExact = alias.endsWith("$")
        const key = isExact ? alias.slice(0, -1) : alias

        if (isExact && specifier === key) return aliases[alias]
        if (!isExact && (specifier === key || specifier.startsWith(key + "/"))) {
            return aliases[alias] + specifier.slice(key.length)
        }
    }

    return null
}

export async function resolveWithExtensions(basePath: string): Promise<string | null> {
    if (/\.\w+$/.test(basePath)) {
        try {
            await apiJson(`/editor/read?path=${encodeURIComponent(basePath)}`)
            return basePath
        } catch {
            return null
        }
    }

    for (const ext of EXTENSIONS) {
        try {
            await apiJson(`/editor/read?path=${encodeURIComponent(basePath + ext)}`)
            return basePath + ext
        } catch { /* try next */ }
    }

    for (const idx of INDEX_FILES) {
        try {
            await apiJson(`/editor/read?path=${encodeURIComponent(basePath + idx)}`)
            return basePath + idx
        } catch { /* try next */ }
    }

    return null
}

export function extractImportSpecifier(line: string): string | null {
    const m = line.match(/from\s+['"]([^'"]+)['"]/) || line.match(/require\(\s*['"]([^'"]+)['"]\s*\)/)
    return m ? m[1] : null
}
