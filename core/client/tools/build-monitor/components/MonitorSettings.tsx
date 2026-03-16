import React from "react"

interface Props {
  autoReload: boolean
  onToggle: () => void
}

export const MonitorSettings: React.FC<Props> = ({ autoReload, onToggle }) => (
  <div className="tfy-mb-3">
    <label className="tfy-block tfy-text-[10px] tfy-font-semibold tfy-uppercase tfy-text-muted tfy-mb-1 tfy-tracking-[0.5px]">Settings</label>
    <div className="tfy-flex tfy-justify-between tfy-items-center tfy-py-1.5">
      <span className="tfy-text-[11px] tfy-text-text">Auto-reload on compile error fix</span>
      <button
        onClick={onToggle}
        className="tfy-relative tfy-w-[34px] tfy-h-[18px] tfy-rounded-[9px] tfy-cursor-pointer tfy-border-0 tfy-p-0 tfy-transition-[background] tfy-duration-200"
        style={{ background: autoReload ? "#58a6ff" : "#30363d" }}
      >
        <span
          className="tfy-absolute tfy-top-0.5 tfy-w-3.5 tfy-h-3.5 tfy-rounded-full tfy-bg-white tfy-transition-[left] tfy-duration-200"
          style={{ left: autoReload ? 18 : 2 }}
        />
      </button>
    </div>
  </div>
)
