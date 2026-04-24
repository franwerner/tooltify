import React, { useState, useEffect, useRef } from "react";
import type { SourceNode } from "../types";
import { buildFullPath } from "../../../shared/utils/serverMeta";

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
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.source) return;
    navigator.clipboard.writeText(buildFullPath(node.source));
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1000);
  };

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
          {hovered && (
            <button
              className="tfy-bg-transparent tfy-rounded tfy-w-[18px] tfy-h-[18px] tfy-cursor-pointer tfy-text-xs tfy-p-0 tfy-ml-1 tfy-shrink-0 tfy-inline-flex tfy-items-center tfy-justify-center tfy-border tfy-border-[#58a6ff60] tfy-text-accent"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy path"}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </>
                )}
              </svg>
            </button>
          )}
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
