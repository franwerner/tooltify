import React from "react"
import type { FileState } from "../hooks/useEditorTabs"

interface Props {
    tabs: FileState[]
    activeIndex: number
    onSwitch: (index: number) => void
    onClose: (index: number) => void
}

export const EditorTabBar: React.FC<Props> = ({ tabs, activeIndex, onSwitch, onClose }) => (
    <div className="tfy-flex tfy-items-stretch tfy-text-[11px] tfy-text-muted tfy-bg-[#010409] tfy-border-b tfy-border-term-border tfy-overflow-auto tfy-whitespace-nowrap tfy-shrink-0">
        {tabs.map((tab, i) => {
            const name = tab.path.split("/").pop() || tab.path
            const isActive = i === activeIndex
            const isModified = tab.content !== tab.original

            return (
                <div
                    key={tab.path}
                    className={isActive
                        ? "tfy-flex tfy-items-center tfy-gap-1.5 tfy-py-1.5 tfy-px-3 tfy-cursor-default tfy-border-r tfy-border-r-term-border tfy-bg-term-bg tfy-text-text tfy-relative tfy-border-t-2 tfy-border-t-co tfy-select-none"
                        : "tfy-flex tfy-items-center tfy-gap-1.5 tfy-py-1.5 tfy-px-3 tfy-cursor-pointer tfy-border-r tfy-border-r-term-border tfy-bg-transparent tfy-text-muted tfy-relative tfy-transition-[background,color] tfy-duration-150 tfy-select-none"
                    }
                    onClick={isActive ? undefined : () => onSwitch(i)}
                    onMouseDown={(e) => {
                        if (e.button !== 1) return
                        e.preventDefault()
                        if (tabs.length > 1) onClose(i)
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#161b22" }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                    title={tab.path}
                >
                    <span className="tfy-w-[7px] tfy-h-[7px] tfy-rounded-full tfy-bg-muted tfy-shrink-0" />
                    <span>{name}</span>
                    {isModified && <span className="tfy-text-orange tfy-text-[14px] tfy-leading-none">●</span>}
                    {tabs.length > 1 && (
                        <button
                            className="tfy-inline-flex tfy-items-center tfy-justify-center tfy-w-4 tfy-h-4 tfy-rounded tfy-border-0 tfy-bg-transparent tfy-text-muted tfy-cursor-pointer tfy-text-[12px] tfy-leading-none tfy-p-0 tfy-ml-0.5"
                            onClick={(e) => { e.stopPropagation(); onClose(i) }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#21262d" }}
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
