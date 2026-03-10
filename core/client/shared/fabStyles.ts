import type { CSSProperties } from "react";
import { COLORS } from "./colors";

export { COLORS };

export const fabStyle: CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 62,
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
  transition: "border-color 0.15s ease, color 0.15s ease",
  padding: 0,
};
