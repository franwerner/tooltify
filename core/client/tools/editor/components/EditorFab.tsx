import React, { useState } from "react";
import { FabButton } from "../../../shared/components/FabButton";

interface Props {
  active: boolean;
  onClick: () => void;
}

export const EditorFab: React.FC<Props> = ({ active, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <FabButton
      style={{
        right: 104,
        borderColor: active || hover ? "#3fb950" : "#30363d",
        color: active || hover ? "#3fb950" : "#8b949e",
      }}
      title={active ? "Click any element to edit" : "Mini IDE (Shift+F3)"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {/* </> code icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    </FabButton>
  );
};
