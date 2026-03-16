import React, { useState, useEffect } from "react";
import type { SourceNode } from "../types";

interface Props {
  node: SourceNode;
  depth: number;
  onOpen: (source: string) => void;
  onEdit?: (source: string) => void;
  dimmed?: boolean;
  highlight?: boolean;
}

export const NodeRow: React.FC<Props> = ({ node, depth, onOpen, onEdit, dimmed, highlight }) => {
  const [hovered, setHovered] = useState(false);
  const [ctrlHeld, setCtrlHeld] = useState(false);
  const clickable = !!node.source;

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(false); };
    const blur = () => setCtrlHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return (
    <div
      className="tfy-flex tfy-items-baseline tfy-text-[11px] tfy-leading-relaxed tfy-transition-[background] tfy-duration-100 tfy-cursor-default"
      style={{
        paddingLeft: 12 + depth * 16,
        opacity: dimmed && !node.source ? 0.4 : 1,
        background: highlight ? "#58a6ff15" : hovered && clickable ? "#21262d" : "transparent",
        borderLeft: highlight ? "2px solid #58a6ff" : "2px solid transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="tfy-text-purple tfy-mr-1.5">&lt;{node.tag}&gt;</span>
      {node.source ? (
        <>
          <span
            className="tfy-text-accent tfy-break-all tfy-flex-1"
            style={{
              textDecoration: hovered && ctrlHeld ? "underline" : "none",
              cursor: hovered && ctrlHeld ? "pointer" : "default",
            }}
            onClick={(e) => { if (e.ctrlKey || e.metaKey) onOpen(node.source!); }}
            title={ctrlHeld ? "Open in VSCode" : "Ctrl+Click for VSCode"}
          >
            {node.source}
          </span>
          {hovered && onEdit && (
            <button
              className="tfy-bg-transparent tfy-rounded tfy-w-[18px] tfy-h-[18px] tfy-cursor-pointer tfy-text-xs tfy-p-0 tfy-ml-1 tfy-shrink-0 tfy-inline-flex tfy-items-center tfy-justify-center tfy-border tfy-border-[#3fb95060] tfy-text-green"
              onClick={(e) => { e.stopPropagation(); onEdit(node.source!); }}
              title="Open in IDE"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>
          )}
        </>
      ) : (
        <span className="tfy-text-muted tfy-italic tfy-flex-1">no source</span>
      )}
    </div>
  );
};
