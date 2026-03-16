import type { CSSProperties } from "react";
import { COLORS, TERM } from "./colors";

/* ── Shared base styles for tool panels ── */

export const titleBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  background: TERM.surface,
  borderBottom: `1px solid ${TERM.border}`,
  userSelect: "none",
  cursor: "grab",
};

export const titleDots: CSSProperties = {
  display: "flex",
  gap: 5,
};

export const titleDot: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  display: "inline-block",
};

export const titleBtnGroup: CSSProperties = {
  display: "flex",
  gap: 4,
};

export const titleBtn: CSSProperties = {
  background: "none",
  border: "none",
  color: COLORS.muted,
  cursor: "pointer",
  fontSize: 15,
  padding: 0,
  lineHeight: 1,
  width: 20,
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
};

export const statusBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "4px 14px 5px",
  borderTop: `1px solid ${TERM.border}`,
  background: TERM.surface,
  fontSize: 10,
  color: COLORS.muted,
};

export const panelCard: CSSProperties = {
  background: TERM.bg,
  border: `1px solid ${TERM.border}`,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
};
