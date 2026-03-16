import React, { useState, useEffect, useRef, useCallback } from "react"
import type { OnMount } from "@monaco-editor/react"
import { TERM, CO } from "../../shared/styles/colors"
import { useDragResize } from "../../shared/hooks/useDragResize"
import { ResizeHandles } from "../../shared/components/ResizeHandles"
import { useEditorTabs } from "./hooks/useEditorTabs"
import { useEditorFile } from "./hooks/useEditorFile"
import { useImportNavigation } from "./hooks/useImportNavigation"
import { EditorTitleBar } from "./components/EditorTitleBar"
import { EditorTabBar } from "./components/EditorTabBar"
import { EditorStatusBar } from "./components/EditorStatusBar"
import { EditorArea } from "./components/EditorArea"

interface Props {
    source: string
    onClose: () => void
}

function parseSource(src: string) {
    const m = src.match(/^(.+?)(?::(\d+))?$/)
    return { path: m ? m[1] : src, line: m?.[2] ? parseInt(m[2], 10) : 1 }
}

function injectImportLinkStyle() {
    const id = "mini-editor-import-links"
    if (document.getElementById(id)) return
    const style = document.createElement("style")
    style.id = id
    style.textContent = `.import-link-decoration { text-decoration: underline !important; color: #fff !important; cursor: pointer !important; }`
    document.head.appendChild(style)
}

export const MiniEditor: React.FC<Props> = ({ source, onClose }) => {
    const { containerStyle, dragHandlers, resizeHandlers } = useDragResize({
        storageKey: "mini-editor-cfg",
        defaultW: 820,
        defaultH: Math.round(window.innerHeight * 0.75),
        minW: 400, minH: 300,
        defaultPosition: "center",
    })

    const editorRef = useRef<any>(null)
    const monacoRef = useRef<any>(null)
    const saveRef = useRef<() => void>(() => { })

    const [error, setError] = useState<string | null>(null)

    const { tabs, activeIndex, current, updateCurrent, switchTab, closeTab, openTab, initTab } = useEditorTabs(onClose)

    const { loadFile, save, loading, saving, savedFlash } = useEditorFile({
        onLoaded: (data) => {
            initTab({ path: data.path, line: parseSource(source).line, content: data.content, original: data.content, lang: data.lang })
        },
        onLoadError: setError,
        onSaved: () => updateCurrent({ original: current?.content ?? "" }),
    })

    const openFile = useCallback((filePath: string, line: number) => {
        const isNew = openTab({ path: filePath, line, content: "", original: "", lang: "plaintext" }, editorRef)
        if (!isNew) return
        setError(null)
        loadFile(filePath)
    }, [openTab, loadFile])

    const { resolving, navigate, setupDecorations } = useImportNavigation({
        currentPath: current?.path ?? "",
        onNavigate: openFile,
    })

    // Initial load
    useEffect(() => {
        const { path } = parseSource(source)
        loadFile(path)
    }, [])

    const handleSave = useCallback(() => {
        if (!current || saving) return
        save(current.path, current.content)
    }, [current, saving, save])

    saveRef.current = handleSave

    const handleMount: OnMount = useCallback((editor, monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco
        injectImportLinkStyle()

        const line = current?.line ?? 1
        if (line > 1) {
            setTimeout(() => {
                editor.revealLineInCenter(line)
                editor.setPosition({ lineNumber: line, column: 1 })
                editor.focus()
            }, 50)
        } else {
            editor.focus()
        }

        setupDecorations(editor, monaco)

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveRef.current())

        editor.onMouseDown((e: any) => {
            if (!(e.event.ctrlKey || e.event.metaKey) || e.target?.type !== 6) return
            const pos = e.target.position
            const model = editor.getModel()
            if (!pos || !model) return
            e.event.preventDefault()
            navigate(editorRef)
        })
    }, [current?.line, setupDecorations, navigate])

    useEffect(() => {
        const editor = editorRef.current
        if (editor && current && !loading) {
            setTimeout(() => {
                editor.revealLineInCenter(current.line)
                editor.setPosition({ lineNumber: current.line, column: 1 })
                editor.focus()
            }, 50)
        }
    }, [activeIndex])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            const modified = current?.content !== current?.original
            if (tabs.length > 1) closeTab(activeIndex)
            else if (modified) { if (confirm("Unsaved changes. Close anyway?")) onClose() }
            else onClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onClose, current, tabs, activeIndex, closeTab])

    const fileName = current?.path.split("/").pop() || current?.path || ""
    const modified = current ? current.content !== current.original : false

    return (
        <div style={{ ...cardStyle, ...containerStyle }}>
            <ResizeHandles {...resizeHandlers} />
            <EditorTitleBar
                fileName={fileName}
                currentPath={current?.path ?? ""}
                currentLine={current?.line ?? 1}
                modified={modified}
                dragHandlers={dragHandlers}
                onClose={onClose}
            />
            {tabs.length > 0 && (
                <EditorTabBar
                    tabs={tabs}
                    activeIndex={activeIndex}
                    onSwitch={(i) => switchTab(i, editorRef)}
                    onClose={closeTab}
                />
            )}
            <EditorArea
                content={current?.content ?? null}
                lang={current?.lang ?? "plaintext"}
                loading={loading}
                error={error}
                onMount={handleMount}
                onChange={(val) => updateCurrent({ content: val })}
            />
            <EditorStatusBar
                lang={current?.lang ?? "plaintext"}
                modified={modified}
                saving={saving}
                savedFlash={savedFlash}
                resolving={resolving}
                onSave={handleSave}
            />
        </div>
    )
}

const cardStyle = {
    background: TERM.bg,
    border: `1px solid ${TERM.border}`,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    boxShadow: `0 0 0 1px ${CO}30, 0 16px 64px rgba(0,0,0,0.6)`,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    zIndex: 10000000,
}
