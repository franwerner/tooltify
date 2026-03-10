import type { CSSProperties } from "react";
import { COLORS } from "../../shared/colors";

export { COLORS };

export const styles: Record<string, CSSProperties> = {
  overlay: {
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 12,
    zIndex: 999999,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    overflow: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: 600,
    fontSize: 13,
    cursor: "grab",
    userSelect: "none",
  },

  closeBtn: {
    background: "none",
    border: "none",
    color: COLORS.muted,
    cursor: "pointer",
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },

  body: {
    padding: "10px 14px",
    overflowY: "auto",
    flex: 1,
  },

  section: {
    marginBottom: 12,
  },

  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    color: COLORS.muted,
    marginBottom: 4,
    letterSpacing: "0.5px",
  },

  input: {
    width: "100%",
    background: COLORS.input,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    color: COLORS.text,
    padding: "6px 8px",
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  },

  row: {
    display: "flex",
    gap: 6,
  },

  addBtn: {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },

  tags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
    marginTop: 6,
  },

  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: COLORS.tag,
    color: COLORS.accent,
    borderRadius: 3,
    padding: "2px 8px",
    fontSize: 11,
  },

  tagRemove: {
    background: "none",
    border: "none",
    color: COLORS.muted,
    cursor: "pointer",
    padding: 0,
    fontSize: 13,
    lineHeight: 1,
  },

  muted: {
    color: COLORS.muted,
    fontSize: 11,
    fontStyle: "italic",
  },

  dot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    marginRight: 6,
  },

  dotConnected: {
    backgroundColor: COLORS.green,
  },

  dotDisconnected: {
    backgroundColor: COLORS.red,
  },

  eventScroll: {
    maxHeight: 300,
    overflowY: "auto" as const,
    padding: 10,
  },

  eventList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  eventItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "6px 0",
    borderBottom: `1px solid ${COLORS.border}`,
    gap: 8,
  },

  eventFile: {
    color: COLORS.text,
    wordBreak: "break-all" as const,
    flex: 1,
    fontSize: 11,
  },

  eventUser: {
    color: COLORS.accent,
    fontWeight: 600,
    fontSize: 11,
  },

  eventTime: {
    color: COLORS.muted,
    fontSize: 10,
    whiteSpace: "nowrap" as const,
  },

  eventApplied: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: 600,
  },

  eventSkipped: {
    color: COLORS.muted,
    fontSize: 10,
  },

  applyBtn: {
    background: "none",
    border: `1px solid ${COLORS.accent}`,
    color: COLORS.accent,
    borderRadius: 3,
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: 10,
    whiteSpace: "nowrap" as const,
  },

  eventError: {
    background: "rgba(248, 81, 73, 0.1)",
    border: `1px solid ${COLORS.red}33`,
    borderRadius: 4,
    padding: "4px 6px",
    marginTop: 4,
    color: COLORS.red,
    fontSize: 10,
    maxHeight: 80,
    overflowY: "auto" as const,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-all" as const,
    fontFamily: "inherit",
  },

  eventItemError: {
    borderLeft: `3px solid ${COLORS.red}`,
    paddingLeft: 8,
  },

  emptyState: {
    color: COLORS.muted,
    textAlign: "center" as const,
    padding: "20px 0",
    fontSize: 11,
  },

  bubble: {
    position: "fixed" as const,
    bottom: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    zIndex: 999998,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    transition: "transform 0.15s ease, border-color 0.15s ease",
    padding: 0,
  },

  bubbleStatus: {
    position: "absolute" as const,
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "none",
  },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
  },

  toggleLabel: {
    fontSize: 11,
    color: COLORS.text,
  },

  toggleSwitch: {
    position: "relative" as const,
    width: 34,
    height: 18,
    borderRadius: 9,
    cursor: "pointer",
    border: "none",
    padding: 0,
    transition: "background 0.2s",
  },

  toggleKnob: {
    position: "absolute" as const,
    top: 2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    transition: "left 0.2s",
  },
};
