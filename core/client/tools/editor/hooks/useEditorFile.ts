import { useState, useCallback } from "react"
import { useFetch } from "../../../shared/hooks/useFetch"

const LANG_MAP: Record<string, string> = {
    ts: "typescript", tsx: "typescript",
    js: "javascript", jsx: "javascript",
    css: "css", json: "json", graphql: "graphql",
    md: "markdown", html: "html", scss: "scss", less: "less",
}

interface FileResponse {
    content: string
    ext: string
    path: string
}

export interface FileContent {
    content: string
    lang: string
    path: string
}

interface UseEditorFileOptions {
    onLoaded: (data: FileContent) => void
    onLoadError: (err: string) => void
    onSaved: () => void
}

export function useEditorFile({ onLoaded, onLoadError, onSaved }: UseEditorFileOptions) {
    const [savedFlash, setSavedFlash] = useState(false)

    const { execute: execLoad, state: loadState } = useFetch<FileResponse>("/editor/read", {
        lazy: true,
        callbacks: {
            onSuccess: ({ content, ext, path }) => onLoaded({ content, path, lang: LANG_MAP[ext] || "plaintext" }),
            onFailed: onLoadError,
        }
    })

    const { execute: execSave, state: saveState } = useFetch<void>("/editor/save", {
        lazy: true,
        callbacks: {
            onSuccess: () => {
                onSaved()
                setSavedFlash(true)
                setTimeout(() => setSavedFlash(false), 2000)
            }
        }
    })

    const loadFile = useCallback((path: string) => {
        execLoad({ path: `/editor/read?path=${encodeURIComponent(path)}` })
    }, [execLoad])

    const save = useCallback((path: string, content: string) => {
        execSave({
            init: {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path, content }),
            }
        })
    }, [execSave])

    return {
        loadFile,
        save,
        loading: loadState === "loading",
        saving: saveState === "loading",
        savedFlash,
    }
}
