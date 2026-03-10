import React, { useState } from "react";
import { fabStyle, COLORS } from "../../../shared/fabStyles";
import { CO } from "../../../shared/colors";

interface Props {
  active: boolean;
  hasContext: boolean;
  onClick: () => void;
}

export const PromptFab: React.FC<Props> = ({ active, hasContext, onClick }) => {
  const [hover, setHover] = useState(false);
  const lit = active || hasContext;

  return (
    <button
      style={{
        ...fabStyle,
        right: 146,
        borderColor: lit ? CO : hover ? CO + "80" : COLORS.border,
        color: lit ? CO : hover ? CO + "cc" : COLORS.muted,
      }}
      title="Claude Code (Shift+F4)"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {/* Claude sparkle ✦ */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L14.5 8.5L22 12L14.5 15.5L12 23L9.5 15.5L2 12L9.5 8.5Z" />
      </svg>
    </button>
  );
};
