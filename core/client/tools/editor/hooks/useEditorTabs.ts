import { useState, useCallback } from "react"

export interface FileState {
    path: string
    line: number
    content: string
    original: string
    lang: string
}

export function useEditorTabs(onClose: () => void) {
    const [tabs, setTabs] = useState<FileState[]>([])
    const [activeIndex, setActiveIndex] = useState(0)

    const current = tabs[activeIndex] || null

    const updateCurrent = useCallback((updates: Partial<FileState>) => {
        setTabs((prev) => prev.map((t, i) => i === activeIndex ? { ...t, ...updates } : t))
    }, [activeIndex])

    const savePosition = useCallback((editorRef: React.MutableRefObject<any>) => {
        const pos = editorRef.current?.getPosition()
        if (pos) {
            setTabs((prev) => prev.map((t, i) => i === activeIndex ? { ...t, line: pos.lineNumber } : t))
        }
    }, [activeIndex])

    const switchTab = useCallback((index: number, editorRef: React.MutableRefObject<any>) => {
        savePosition(editorRef)
        setActiveIndex(index)
    }, [savePosition])

    const closeTab = useCallback((index: number) => {
        setTabs((prev) => {
            if (prev.length <= 1) { onClose(); return prev }
            const next = prev.filter((_, i) => i !== index)
            if (index < activeIndex) setActiveIndex(activeIndex - 1)
            else if (index === activeIndex) setActiveIndex(Math.min(activeIndex, next.length - 1))
            return next
        })
    }, [activeIndex, onClose])

    const openTab = useCallback((file: FileState, editorRef: React.MutableRefObject<any>) => {
        savePosition(editorRef)

        const existingIdx = tabs.findIndex((t) => t.path === file.path)
        if (existingIdx >= 0) {
            setTabs((prev) => prev.map((t, i) => i === existingIdx ? { ...t, line: file.line } : t))
            setActiveIndex(existingIdx)
            return false
        }

        setTabs((prev) => [...prev.slice(0, activeIndex + 1), file, ...prev.slice(activeIndex + 1)])
        setActiveIndex(activeIndex + 1)
        return true
    }, [tabs, activeIndex, savePosition])

    const initTab = useCallback((file: FileState) => {
        setTabs([file])
        setActiveIndex(0)
    }, [])

    return { tabs, activeIndex, current, updateCurrent, switchTab, closeTab, openTab, initTab }
}
