import React from "react"

interface Props {
    lang: string
    modified: boolean
    saving: boolean
    savedFlash: boolean
    resolving: boolean
    onSave: () => void
}

export const EditorStatusBar: React.FC<Props> = ({
    lang, modified, saving, savedFlash, resolving, onSave
}) => (
    <div className="tfy-flex tfy-items-center tfy-gap-2 tfy-pt-1 tfy-px-3.5 tfy-pb-[5px] tfy-border-t tfy-border-term-border tfy-bg-term-surface tfy-text-[10px] tfy-text-muted">
        <span>{lang}</span>
        {resolving && <span className="tfy-text-co">Resolving...</span>}
        <span className="tfy-ml-auto tfy-flex tfy-items-center tfy-gap-2">
            {savedFlash && <span className="tfy-text-green">Saved</span>}
            {saving && <span className="tfy-text-co">Saving...</span>}
            <span className="tfy-text-term-border">Ctrl+Click import</span>
            <span className="tfy-text-term-border">Ctrl+S</span>
            <button
                className={modified && !saving
                    ? "tfy-bg-co tfy-text-white tfy-border-0 tfy-rounded tfy-py-0.5 tfy-px-3 tfy-text-[10px] tfy-font-semibold tfy-cursor-pointer tfy-font-mono tfy-leading-[18px]"
                    : "tfy-bg-hover tfy-text-muted tfy-border-0 tfy-rounded tfy-py-0.5 tfy-px-3 tfy-text-[10px] tfy-font-semibold tfy-cursor-not-allowed tfy-font-mono tfy-leading-[18px]"
                }
                disabled={!modified || saving}
                onClick={onSave}
            >
                Save
            </button>
        </span>
    </div>
)
