import React, { useState } from "react";
import { FabButton } from "../../../shared/components/FabButton";

interface Props {
  active: boolean;
  onClick: () => void;
}

const COLOR = "#e3b341";

export const InfoFab: React.FC<Props> = ({ active, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <FabButton
      style={{
        right: 146,
        borderColor: active || hover ? COLOR : "#30363d",
        color: active || hover ? COLOR : "#8b949e",
      }}
      title="Keyboard shortcuts (Shift+F4)"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .9-1 1.6" />
        <circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    </FabButton>
  );
};
