import React from "react"
import type { CSSProperties } from "react"
import { COLORS, TERM, CO } from "../../../shared/styles/colors"

interface Props {
    lang: string
    modified: boolean
    saving: boolean
    savedFlash: boolean
    resolving: boolean
    onSave: () => void
}

const s: Record<string, CSSProperties> = {
    statusBar: {
        display: "flex", alignItems: "center", gap: 8, padding: "4px 14px 5px",
        borderTop: `1px solid ${TERM.border}`, background: TERM.surface,
        fontSize: 10, color: COLORS.muted,
    },
    saveBtn: {
        background: CO, color: "#fff", border: "none", borderRadius: 4,
        padding: "2px 12px", fontSize: 10, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", lineHeight: "18px",
    },
    saveBtnDisabled: {
        background: TERM.border, color: COLORS.muted, border: "none", borderRadius: 4,
        padding: "2px 12px", fontSize: 10, fontWeight: 600, cursor: "not-allowed",
        fontFamily: "inherit", lineHeight: "18px",
    },
}

export const EditorStatusBar: React.FC<Props> = ({
    lang, modified, saving, savedFlash, resolving, onSave
}) => (
    <div style={s.statusBar}>
        <span>{lang}</span>
        {resolving && <span style={{ color: CO }}>Resolving...</span>}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {savedFlash && <span style={{ color: "#3fb950" }}>Saved</span>}
            {saving && <span style={{ color: CO }}>Saving...</span>}
            <span style={{ color: TERM.border }}>Ctrl+Click import</span>
            <span style={{ color: TERM.border }}>Ctrl+S</span>
            <button
                style={modified && !saving ? s.saveBtn : s.saveBtnDisabled}
                disabled={!modified || saving}
                onClick={onSave}
            >
                Save
            </button>
        </span>
    </div>
)
