import React from "react"
import type { CSSProperties } from "react"
import { COLORS, TERM, CO } from "../../../shared/styles/colors"
import { openSource } from "../../../shared/utils/openSource"

interface Props {
    fileName: string
    currentPath: string
    currentLine: number
    modified: boolean
    dragHandlers: Record<string, any>
    onClose: () => void
}

const s: Record<string, CSSProperties> = {
    titleBar: {
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        background: TERM.surface, borderBottom: `1px solid ${TERM.border}`,
        userSelect: "none", cursor: "grab",
    },
    titleDots: { display: "flex", gap: 5 },
    dot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
    titlePath: {
        flex: 1, fontSize: 11, color: COLORS.muted, overflow: "hidden",
        textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    titleBtn: {
        background: "none", border: "none", color: COLORS.muted, cursor: "pointer",
        fontSize: 15, padding: 0, lineHeight: 1, width: 20, height: 20,
        display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4,
    },
}

export const EditorTitleBar: React.FC<Props> = ({
    fileName, currentPath, currentLine, modified, dragHandlers, onClose
}) => (
    <div style={s.titleBar} {...dragHandlers}>
        <div style={s.titleDots}>
            <span style={{ ...s.dot, background: "#f85149" }} />
            <span style={{ ...s.dot, background: "#d29922" }} />
            <span style={{ ...s.dot, background: "#3fb950" }} />
        </div>
        <span
            style={{ ...s.titlePath, cursor: "default" }}
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
                e.currentTarget.style.color = ctrl ? "#fff" : COLORS.muted
                e.currentTarget.style.textDecoration = ctrl ? "underline" : "none"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.cursor = "default"
                e.currentTarget.style.color = COLORS.muted
                e.currentTarget.style.textDecoration = "none"
            }}
        >
            <span>{fileName}</span>
            {currentPath !== fileName && <span style={{ marginLeft: 6 }}>{currentPath}</span>}
            {modified && <span style={{ color: "#d29922", marginLeft: 6 }}>●</span>}
        </span>
        <button
            style={s.titleBtn}
            onClick={() => { if (!modified || confirm("Unsaved changes. Close?")) onClose() }}
        >
            &times;
        </button>
    </div>
)
