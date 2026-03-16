import React, { useState } from "react";
import { FabButton } from "../../../shared/components/FabButton";

interface Props {
  active: boolean;
  onToggle: () => void;
}

export const TrackerFab: React.FC<Props> = ({ active, onToggle }) => {
  const [hover, setHover] = useState(false);

  return (
    <FabButton
      style={{
        right: 62,
        borderColor: active || hover ? "#58a6ff" : "#30363d",
        color: active || hover ? "#58a6ff" : "#8b949e",
      }}
      title={active ? "Click any element to inspect" : "Source Tracker (Shift+F2)"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onToggle}
    >
      {/* Crosshair / selector icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="1" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="19" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </FabButton>
  );
};
