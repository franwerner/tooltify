import React from "react"
import { styles, COLORS } from "../styles"

interface Props {
  autoReload: boolean
  onToggle: () => void
}

export const MonitorSettings: React.FC<Props> = ({ autoReload, onToggle }) => (
  <div style={styles.section}>
    <label style={styles.label}>Settings</label>
    <div style={styles.toggleRow}>
      <span style={styles.toggleLabel}>Auto-reload on compile error fix</span>
      <button
        onClick={onToggle}
        style={{
          ...styles.toggleSwitch,
          background: autoReload ? COLORS.accent : COLORS.border,
        }}
      >
        <span style={{ ...styles.toggleKnob, left: autoReload ? 18 : 2 }} />
      </button>
    </div>
  </div>
)
