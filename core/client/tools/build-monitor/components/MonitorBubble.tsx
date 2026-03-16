import React, { useState } from "react"
import { FabButton } from "../../../shared/components/FabButton"

interface Props {
  open: boolean
  connected: boolean
  building: boolean
  hasCompileError: boolean
  onToggle: () => void
}

export const MonitorBubble: React.FC<Props> = ({ open, connected, building, hasCompileError, onToggle }) => {
  const [hover, setHover] = useState(false)

  const dotColor = hasCompileError ? "#f85149" : building ? "#d29922" : connected ? "#3fb950" : "#f85149"
  const active = open || hover

  return (
    <FabButton
      style={{
        right: 20,
        borderColor: active ? "#bc8cff" : "#30363d",
        transform: hover ? "scale(1.05)" : "scale(1)",
      }}
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Build Monitor (Shift+F1)"
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#bc8cff" : "#8b949e"}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <span className="tfy-absolute tfy-top-[-2px] tfy-right-[-2px] tfy-w-2 tfy-h-2 tfy-rounded-full" style={{ backgroundColor: dotColor }} />
    </FabButton>
  )
}
