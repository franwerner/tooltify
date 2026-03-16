import React, { useMemo, useEffect } from "react";
import { NodeRow } from "./NodeRow";
import { VirtualTreeView } from "./VirtualTreeView";
import { flattenTree } from "../utils/tree";
import type { CapturedTree } from "../types";

interface Props {
  capture: CapturedTree;
  onOpen: (source: string) => void;
  onEdit: (source: string) => void;
  onClose: () => void;
}

const labelClass = "tfy-text-[10px] tfy-font-semibold tfy-uppercase tfy-text-muted tfy-tracking-[0.5px] tfy-py-1 tfy-px-5";

export const InspectModal: React.FC<Props> = ({ capture, onOpen, onEdit, onClose }) => {
  const childCount = useMemo(
    () => flattenTree(capture.clicked.children).length,
    [capture.clicked.children]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="tfy-fixed tfy-inset-0 tfy-bg-black/60 tfy-z-[9999999] tfy-flex tfy-items-center tfy-justify-center tfy-font-mono tfy-backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="tfy-bg-[#1a1d23] tfy-border tfy-border-border tfy-rounded-xl tfy-w-[90%] tfy-max-w-[640px] tfy-max-h-[80vh] tfy-flex tfy-flex-col tfy-overflow-hidden tfy-shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tfy-flex tfy-justify-between tfy-items-center tfy-border-b tfy-border-border tfy-py-3 tfy-px-5">
          <span className="tfy-text-accent tfy-font-bold tfy-text-[13px]">Source Tracker</span>
          <button className="tfy-bg-transparent tfy-border-0 tfy-text-muted tfy-cursor-pointer tfy-text-xl tfy-p-0 tfy-leading-none" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="tfy-overflow-auto tfy-flex-1 tfy-flex tfy-flex-col tfy-py-2">
          {capture.parents.length > 0 && (
            <div className="tfy-mb-1">
              <div className={labelClass}>Parent chain</div>
              {capture.parents.map((p, i) => (
                <NodeRow key={i} node={p} depth={0} dimmed onOpen={onOpen} onEdit={onEdit} />
              ))}
            </div>
          )}

          <div className="tfy-mb-1">
            <div className={labelClass}>Clicked element</div>
            <NodeRow
              node={{ tag: capture.clicked.tag, source: capture.clicked.source, children: [] }}
              depth={0}
              highlight
              onOpen={onOpen}
              onEdit={onEdit}
            />
          </div>

          {capture.clicked.children.length > 0 && (
            <div className="tfy-mb-1 tfy-flex-1 tfy-flex tfy-flex-col tfy-min-h-0">
              <div className={labelClass}>
                Children{" "}
                <span className="tfy-font-normal">({childCount})</span>
              </div>
              <VirtualTreeView nodes={capture.clicked.children} onOpen={onOpen} onEdit={onEdit} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
