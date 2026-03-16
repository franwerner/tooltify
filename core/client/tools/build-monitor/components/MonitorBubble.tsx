import React, { useState } from "react"
import { styles, COLORS } from "../styles"

interface Props {
  open: boolean
  connected: boolean
  building: boolean
  hasCompileError: boolean
  onToggle: () => void
}

export const MonitorBubble: React.FC<Props> = ({
  open,
  connected,
  building,
  hasCompileError,
  onToggle,
}) => {
  const [hover, setHover] = useState(false)

  const dotColor = hasCompileError
    ? COLORS.red
    : building
      ? COLORS.orange
      : connected
        ? COLORS.green
        : COLORS.red

  return (
    <button
      style={{
        ...styles.bubble,
        borderColor: open || hover ? COLORS.purple : COLORS.border,
        transform: hover ? "scale(1.05)" : "scale(1)",
      }}
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Build Monitor (Shift+F1)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={open || hover ? COLORS.purple : COLORS.muted}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <span style={{ ...styles.bubbleStatus, backgroundColor: dotColor }} />
    </button>
  )
}
