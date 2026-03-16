import React, { useState, useEffect } from "react"
import { styles } from "./styles"
import { useRebuildEvents } from "./hooks/useRebuildEvents"
import { useSubscribedUsers } from "./hooks/useSubscribedUsers"
import { useAutoReload } from "./hooks/useAutoReload"
import { useSession } from "../../features/auth/AuthGate"
import { useActiveTool } from "../../shared/components/ActiveToolContext"
import { useDragResize } from "../../shared/hooks/useDragResize"
import { ResizeHandles } from "../../shared/components/ResizeHandles"
import { MonitorBubble } from "./components/MonitorBubble"
import { MonitorSettings } from "./components/MonitorSettings"
import { UserConfig } from "./components/UserConfig"
import { EventLog } from "./components/EventLog"
import {
  onCompileErrorChange,
  onCompileErrorCountChange,
  openCompileErrorOverlay,
} from "./utils/compileErrorBus"
import { useFetch } from "../../shared/hooks/useFetch"

export const DevtoolsPanel: React.FC = () => {
  const { containerStyle, dragHandlers, resizeHandlers } = useDragResize({
    storageKey: "build-monitor-cfg",
    defaultW: 380,
    defaultH: 500,
    minW: 300,
    minH: 250,
    defaultPosition: "bottom-right",
  })

  const tool = useActiveTool()
  const open = tool.activeTool === "monitor"

  const { user } = useSession()
  const { subscribed, add, remove } = useSubscribedUsers(user)
  const { autoReload, toggle: toggleAutoReload } = useAutoReload(user)
  const { data: availableUsers } = useFetch<Array<string>>("/auth/users")
  const { events, connected, building, applyEvent } = useRebuildEvents()

  const [hasCompileError, setHasCompileError] = useState(false)
  const [compileErrorCount, setCompileErrorCount] = useState(0)

  useEffect(() => onCompileErrorChange(setHasCompileError), [])
  useEffect(() => onCompileErrorCountChange(setCompileErrorCount), [])

  return (
    <>
      <MonitorBubble
        open={open}
        connected={connected}
        building={building}
        hasCompileError={hasCompileError}
        onToggle={() => tool.toggle("monitor")}
      />

      {open && (
        <div style={{ ...styles.overlay, ...containerStyle }}>
          <ResizeHandles {...resizeHandlers} />
          <div style={styles.header} {...dragHandlers}>
            <span>Build Monitor</span>
            <button style={styles.closeBtn} onClick={() => tool.close("monitor")}>
              &times;
            </button>
          </div>
          <div style={styles.body}>
            <UserConfig
              user={user}
              subscribed={subscribed}
              onAdd={add}
              onRemove={remove}
              availableUsers={availableUsers || []}
            />
            <EventLog
              events={events}
              connected={connected}
              building={building}
              onApply={applyEvent}
              hasCompileError={hasCompileError}
              compileErrorCount={compileErrorCount}
              onShowCompileError={openCompileErrorOverlay}
            />
            <MonitorSettings autoReload={autoReload} onToggle={toggleAutoReload} />
          </div>
        </div>
      )}
    </>
  )
}
