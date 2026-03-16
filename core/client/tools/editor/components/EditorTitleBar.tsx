import React from "react"
import { openSource } from "../../../shared/utils/openSource"

interface Props {
    fileName: string
    currentPath: string
    currentLine: number
    modified: boolean
    dragHandlers: Record<string, any>
    onClose: () => void
}

export const EditorTitleBar: React.FC<Props> = ({
    fileName, currentPath, currentLine, modified, dragHandlers, onClose
}) => (
    <div
        className="tfy-flex tfy-items-center tfy-gap-2 tfy-py-2 tfy-px-3.5 tfy-bg-term-surface tfy-border-b tfy-border-term-border tfy-select-none tfy-cursor-grab"
        {...dragHandlers}
    >
        <div className="tfy-flex tfy-gap-[5px]">
            <span className="tfy-w-2.5 tfy-h-2.5 tfy-rounded-full tfy-inline-block tfy-bg-red" />
            <span className="tfy-w-2.5 tfy-h-2.5 tfy-rounded-full tfy-inline-block tfy-bg-orange" />
            <span className="tfy-w-2.5 tfy-h-2.5 tfy-rounded-full tfy-inline-block tfy-bg-green" />
        </div>
        <span
            className="tfy-flex-1 tfy-text-[11px] tfy-text-muted tfy-overflow-hidden tfy-text-ellipsis tfy-whitespace-nowrap tfy-cursor-default"
            title={`${currentPath} — Ctrl+Click to open in IDE`}
            onPointerDown={(e) => { if (e.ctrlKey || e.metaKey) e.stopPropagation() }}
            onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    openSource(currentPath + (currentLine > 1 ? `:${currentLine}` : ""))
                }
            }}
            onMouseMove={(e) => {
                const ctrl = e.ctrlKey || e.metaKey
                e.currentTarget.style.cursor = ctrl ? "pointer" : "default"
                e.currentTarget.style.color = ctrl ? "#fff" : "#8b949e"
                e.currentTarget.style.textDecoration = ctrl ? "underline" : "none"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.cursor = "default"
                e.currentTarget.style.color = "#8b949e"
                e.currentTarget.style.textDecoration = "none"
            }}
        >
            <span>{fileName}</span>
            {currentPath !== fileName && <span className="tfy-ml-1.5">{currentPath}</span>}
            {modified && <span className="tfy-text-orange tfy-ml-1.5">●</span>}
        </span>
        <button
            className="tfy-bg-transparent tfy-border-0 tfy-text-muted tfy-cursor-pointer tfy-text-[15px] tfy-p-0 tfy-leading-none tfy-w-5 tfy-h-5 tfy-flex tfy-items-center tfy-justify-center tfy-rounded"
            onClick={() => { if (!modified || confirm("Unsaved changes. Close?")) onClose() }}
        >
            &times;
        </button>
    </div>
)
