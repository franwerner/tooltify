import type { CSSProperties } from "react";
import { COLORS } from "../../shared/colors";

export { COLORS };

export const styles: Record<string, CSSProperties> = {
  activeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: COLORS.accent,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    zIndex: 9999999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(3px)",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },

  card: {
    background: "#1a1d23",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    width: "90%",
    maxWidth: 640,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
  },

  headerTitle: {
    color: COLORS.accent,
    fontWeight: 700,
    fontSize: 13,
  },

  closeBtn: {
    background: "none",
    border: "none",
    color: COLORS.muted,
    cursor: "pointer",
    fontSize: 20,
    padding: 0,
    lineHeight: 1,
  },

  body: {
    overflow: "auto",
    padding: "8px 0",
    flex: 1,
  },

  section: {
    marginBottom: 4,
  },

  label: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    color: COLORS.muted,
    padding: "4px 20px",
    letterSpacing: "0.5px",
  },

  row: {
    display: "flex",
    alignItems: "baseline",
    padding: "4px 12px",
    fontSize: 11,
    lineHeight: 1.6,
    transition: "background 0.1s",
    cursor: "default",
    borderLeft: "2px solid transparent",
  },

  rowHighlight: {
    background: `${COLORS.accent}15`,
    borderLeft: `2px solid ${COLORS.accent}`,
  },

  tag: {
    color: COLORS.purple,
    marginRight: 6,
  },

  sourceLink: {
    color: COLORS.accent,
    cursor: "pointer",
    wordBreak: "break-all",
    flex: 1,
  },

  noSource: {
    color: COLORS.muted,
    fontStyle: "italic",
    flex: 1,
  },
};
