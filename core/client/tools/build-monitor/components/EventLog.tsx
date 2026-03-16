import React, { useState } from "react";
import { styles, COLORS } from "../styles";
import { storage } from "../../../shared/utils/storage";
import type { RebuildEvent } from "../types";

interface Props {
  events: RebuildEvent[];
  connected: boolean;
  building: boolean;
  onApply: (index: number) => void;
  hasCompileError?: boolean;
  compileErrorCount?: number;
  onShowCompileError?: () => void;
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const shortFile = (file: string) => {
  if (!file) return "(unknown file)";
  const idx = file.indexOf("/packages/");
  return idx !== -1 ? file.slice(idx + 1) : file;
};

const extractPlugin = (file: string) => {
  const m = file.match(/plugin-([^/]+)-(?:ui|api)/);
  return m ? m[1] : null;
};

const statusBadge = (evt: RebuildEvent, onReload: () => void) => {
  if (evt.status === "building") {
    return (
      <span style={{ color: COLORS.orange, fontSize: 10, fontWeight: 600 }}>
        building...
      </span>
    );
  }
  if (evt.status === "error" && evt.errorType === "compile") {
    return (
      <button
        style={{
          ...styles.applyBtn,
          background: `${COLORS.red}20`,
          color: COLORS.red,
          borderColor: `${COLORS.red}40`,
        }}
        onClick={onReload}
      >
        Reload
      </button>
    );
  }
  if (evt.status === "error") {
    return (
      <span style={{ color: COLORS.red, fontSize: 10, fontWeight: 600 }}>
        runtime error
      </span>
    );
  }
  if (evt.applied) {
    return <span style={styles.eventApplied}>applied</span>;
  }
  return null;
};

export const EventLog: React.FC<Props> = ({ events, connected, building, onApply, hasCompileError, compileErrorCount = 0, onShowCompileError }) => {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const currentUser = storage.getUser();

  const toggleError = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div style={styles.section}>
      <div
        style={{
          ...styles.label,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            ...styles.dot,
            backgroundColor: hasCompileError
              ? COLORS.red
              : building
                ? COLORS.orange
                : connected
                  ? COLORS.green
                  : COLORS.red,
          }}
        />
        Changes{" "}
        {hasCompileError
          ? "(compile error)"
          : building
            ? "(building...)"
            : connected
              ? "(live)"
              : "(disconnected)"}
        {(events.length > 0 || hasCompileError) && (
          <span style={{ color: hasCompileError ? COLORS.red : COLORS.muted, fontWeight: 400 }}>
            ({hasCompileError ? compileErrorCount : events.length})
          </span>
        )}
      </div>

      {hasCompileError && onShowCompileError && (
        <button
          onClick={onShowCompileError}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            background: `${COLORS.red}12`,
            border: `1px solid ${COLORS.red}30`,
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            color: COLORS.red,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "inherit",
            marginBottom: 8,
          }}
        >
          Compile error detected — Show Details
        </button>
      )}

      <div style={styles.eventScroll}>
        {events.length === 0 || hasCompileError ? (
          <div style={styles.emptyState}>
            {hasCompileError ? "Fix compilation errors to resume" : "No changes yet"}
          </div>
        ) : (
          <ul style={styles.eventList}>
            {events.map((evt, i) => {
              const isSelf = currentUser && evt.user === currentUser;
              const isBuilding = evt.status === "building";
              const hasError = evt.status === "error";

              return (
                <li
                  key={`${evt.timestamp}-${i}`}
                  style={{
                    ...styles.eventItem,
                    ...(hasError ? styles.eventItemError : {}),
                    ...(isBuilding
                      ? { borderLeft: `3px solid ${COLORS.orange}`, paddingLeft: 8 }
                      : {}),
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {extractPlugin(evt.file) && (
                      <div
                        style={{ fontSize: 10, color: COLORS.muted, marginBottom: 1 }}
                      >
                        {extractPlugin(evt.file)}
                      </div>
                    )}

                    <div
                      style={{
                        ...styles.eventFile,
                        ...(isBuilding ? { color: COLORS.orange } : {}),
                      }}
                    >
                      {shortFile(evt.file)}
                    </div>

                    <div
                      style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 11,
                          color: isSelf ? COLORS.green : COLORS.purple,
                        }}
                      >
                        {evt.user}
                        {isSelf ? " (you)" : ""}
                      </span>
                      <span style={styles.eventTime}>
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>

                    {hasError && (
                      <>
                        <button
                          onClick={() => toggleError(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.red,
                            cursor: "pointer",
                            fontSize: 10,
                            padding: "2px 0",
                            fontFamily: "inherit",
                          }}
                        >
                          {expanded.has(i) ? "- hide error" : "+ show error"}
                        </button>
                        {expanded.has(i) && (
                          <div style={styles.eventError}>{evt.error}</div>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {statusBadge(evt, () => window.location.reload()) || (
                      <button
                        style={styles.applyBtn}
                        onClick={() => onApply(i)}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
