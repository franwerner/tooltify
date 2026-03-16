import React from "react"
import type { CSSProperties } from "react"
import { COLORS, TERM, CO } from "../../../shared/styles/colors"
import type { FileState } from "../hooks/useEditorTabs"

interface Props {
    tabs: FileState[]
    activeIndex: number
    onSwitch: (index: number) => void
    onClose: (index: number) => void
}

const s: Record<string, CSSProperties> = {
    tabBar: {
        display: "flex", alignItems: "stretch", fontSize: 11, color: COLORS.muted,
        background: "#010409", borderBottom: `1px solid ${TERM.border}`,
        overflow: "auto", whiteSpace: "nowrap", flexShrink: 0,
    },
    tab: {
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
        cursor: "pointer", borderRight: `1px solid ${TERM.border}`,
        background: "transparent", color: COLORS.muted, position: "relative" as const,
        transition: "background 0.15s, color 0.15s", userSelect: "none" as const,
    },
    tabActive: {
        display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
        cursor: "default", borderRight: `1px solid ${TERM.border}`,
        background: TERM.bg, color: "#e6edf3", position: "relative" as const,
        borderTop: `2px solid ${CO}`, userSelect: "none" as const,
    },
    tabClose: {
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 16, height: 16, borderRadius: 3, border: "none",
        background: "transparent", color: COLORS.muted, cursor: "pointer",
        fontSize: 12, lineHeight: 1, padding: 0, marginLeft: 2,
    },
}

export const EditorTabBar: React.FC<Props> = ({ tabs, activeIndex, onSwitch, onClose }) => (
    <div style={s.tabBar}>
        {tabs.map((tab, i) => {
            const name = tab.path.split("/").pop() || tab.path
            const isActive = i === activeIndex
            const isModified = tab.content !== tab.original

            return (
                <div
                    key={tab.path}
                    style={isActive ? s.tabActive : s.tab}
                    onClick={isActive ? undefined : () => onSwitch(i)}
                    onMouseDown={(e) => {
                        if (e.button !== 1) return
                        e.preventDefault()
                        if (tabs.length > 1) onClose(i)
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = TERM.surface }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                    title={tab.path}
                >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.muted, flexShrink: 0 }} />
                    <span>{name}</span>
                    {isModified && <span style={{ color: "#d29922", fontSize: 14, lineHeight: "1" }}>●</span>}
                    {tabs.length > 1 && (
                        <button
                            style={s.tabClose}
                            onClick={(e) => { e.stopPropagation(); onClose(i) }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = TERM.border }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                        >
                            ×
                        </button>
                    )}
                </div>
            )
        })}
    </div>
)
