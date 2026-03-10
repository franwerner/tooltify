import React, { useState, useCallback, useEffect } from "react";
import { styles, COLORS } from "./styles";
import { storage } from "./storage";
import { useRebuildEvents } from "./hooks/useRebuildEvents";
import { useSession } from "../../components/AuthGate";
import { UserConfig } from "./components/UserConfig";
import { EventLog } from "./components/EventLog";
import { onCompileErrorChange, onCompileErrorCountChange, openCompileErrorOverlay } from "./components/CompileErrorOverlay";
import { useDragResize } from "../../shared/useDragResize";
import { ResizeHandles } from "../../shared/ResizeHandles";
import { useActiveTool } from "../../shared/ActiveToolContext";

export const DevtoolsPanel: React.FC = () => {
  const { containerStyle, dragHandlers, resizeHandlers } = useDragResize({
    storageKey: "build-monitor-cfg",
    defaultW: 380,
    defaultH: 500,
    minW: 300,
    minH: 250,
    defaultPosition: "bottom-right",
  });
  const tool = useActiveTool();
  const open = tool.activeTool === "monitor";

  const { user } = useSession();
  const [subscribed, setSubscribed] = useState(storage.getSubscribed);
  const [autoReload, setAutoReload] = useState(storage.getAutoReload);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const { events, connected, building, applyEvent } = useRebuildEvents();
  const [hasCompileError, setHasCompileError] = useState(false);
  const [compileErrorCount, setCompileErrorCount] = useState(0);
  const [bubbleHover, setBubbleHover] = useState(false);

  useEffect(() => onCompileErrorChange(setHasCompileError), []);
  useEffect(() => onCompileErrorCountChange(setCompileErrorCount), []);

  // Fetch SSH users on mount
  useEffect(() => {
    storage.fetchUsers().then(setAvailableUsers);
  }, []);

  useEffect(() => {
    if (user) {
      setSubscribed(storage.getSubscribed());
      setAutoReload(storage.getAutoReload());
    }
  }, [user]);

  const handleAdd = useCallback(
    (name: string) => {
      setSubscribed((prev) => {
        const next = [...prev, name];
        storage.setSubscribed(next);
        return next;
      });
    },
    [user]
  );

  const handleRemove = useCallback(
    (name: string) => {
      setSubscribed((prev) => {
        const next = prev.filter((s) => s !== name);
        storage.setSubscribed(next);
        return next;
      });
    },
    [user]
  );

  const handleToggleAutoReload = useCallback(() => {
    setAutoReload((prev) => {
      const next = !prev;
      storage.setAutoReload(next);
      return next;
    });
  }, [user]);

  return (
    <>
      {/* Floating bubble */}
      {(
        <button
          style={{
            ...styles.bubble,
            borderColor: open || bubbleHover ? COLORS.purple : COLORS.border,
            transform: bubbleHover ? "scale(1.05)" : "scale(1)",
          }}
          onClick={() => tool.toggle("monitor")}
          onMouseEnter={() => setBubbleHover(true)}
          onMouseLeave={() => setBubbleHover(false)}
          title="Build Monitor (Shift+F1)"
        >
          {/* Monitor / build icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open || bubbleHover ? COLORS.purple : COLORS.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span
            style={{
              ...styles.bubbleStatus,
              backgroundColor: hasCompileError
                ? COLORS.red
                : building
                ? COLORS.orange
                : connected
                ? COLORS.green
                : COLORS.red,
            }}
          />
        </button>
      )}

      {/* Panel */}
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
              onAdd={handleAdd}
              onRemove={handleRemove}
              availableUsers={availableUsers}
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

            {/* Settings */}
            <div style={styles.section}>
              <label style={styles.label}>Settings</label>
              <div style={styles.toggleRow}>
                <span style={styles.toggleLabel}>Auto-reload on compile error fix</span>
                <button
                  onClick={handleToggleAutoReload}
                  style={{
                    ...styles.toggleSwitch,
                    background: autoReload ? COLORS.accent : COLORS.border,
                  }}
                >
                  <span
                    style={{
                      ...styles.toggleKnob,
                      left: autoReload ? 18 : 2,
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
