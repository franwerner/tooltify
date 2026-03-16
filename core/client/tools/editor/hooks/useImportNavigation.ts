import { useState, useCallback, useRef } from "react"
import { resolveImport, resolveWithExtensions, extractImportSpecifier } from "../utils/importResolver"

interface UseImportNavigationOptions {
    currentPath: string
    onNavigate: (path: string, line: number) => void
}

export function useImportNavigation({ currentPath, onNavigate }: UseImportNavigationOptions) {
    const [resolving, setResolving] = useState(false)
    const decorationsRef = useRef<any>(null)

    const clearDecorations = useCallback(() => {
        if (decorationsRef.current) {
            decorationsRef.current.clear()
            decorationsRef.current = null
        }
    }, [])

    const navigate = useCallback(async (editorRef: React.MutableRefObject<any>) => {
        const editor = editorRef.current
        if (!editor) return

        const pos = editor.getPosition()
        const model = editor.getModel()
        if (!pos || !model) return

        const lineContent = model.getLineContent(pos.lineNumber)
        const specifier = extractImportSpecifier(lineContent)
        if (!specifier) return

        const resolved = resolveImport(specifier, currentPath)
        if (!resolved) return

        setResolving(true)
        try {
            const realPath = await resolveWithExtensions(resolved)
            if (realPath) onNavigate(realPath, 1)
        } finally {
            setResolving(false)
        }
    }, [currentPath, onNavigate])

    const setupDecorations = useCallback((editor: any, monaco: any) => {
        editor.onMouseMove((e: any) => {
            if (!(e.event.ctrlKey || e.event.metaKey) || e.target?.type !== 6) {
                clearDecorations()
                return
            }
            const pos = e.target.position
            const model = editor.getModel()
            if (!pos || !model) { clearDecorations(); return }

            const line = model.getLineContent(pos.lineNumber)
            const spec = extractImportSpecifier(line)
            if (!spec) { clearDecorations(); return }

            const strMatch = line.match(/['"]([^'"]+)['"]/)
            if (!strMatch) { clearDecorations(); return }

            const startCol = line.indexOf(strMatch[0]) + 2
            const endCol = startCol + strMatch[1].length
            if (pos.column < startCol || pos.column > endCol) { clearDecorations(); return }

            clearDecorations()
            decorationsRef.current = editor.createDecorationsCollection([{
                range: new monaco.Range(pos.lineNumber, startCol, pos.lineNumber, endCol),
                options: { inlineClassName: "import-link-decoration" },
            }])
        })

        editor.onMouseLeave(() => clearDecorations())

        editor.onKeyUp((e: any) => {
            if (e.keyCode === monaco.KeyCode.Ctrl || e.keyCode === monaco.KeyCode.Meta) {
                clearDecorations()
            }
        })
    }, [clearDecorations])

    return { resolving, navigate, setupDecorations }
}
