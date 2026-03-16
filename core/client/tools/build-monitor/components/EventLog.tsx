import React, { useState } from "react";
import { storage } from "../../../shared/utils/storage";
import type { RebuildEvent } from "../types";

interface Props {
  events: RebuildEvent[];
  connected: boolean;
  building: boolean;
  onApply: (index: number) => void;
  hasCompileError?: boolean;
  compileErrorCount?: number;
  onShowCompileError?: () => void;
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const shortFile = (file: string) => {
  if (!file) return "(unknown file)";
  const idx = file.indexOf("/packages/");
  return idx !== -1 ? file.slice(idx + 1) : file;
};

const extractPlugin = (file: string) => {
  const m = file.match(/plugin-([^/]+)-(?:ui|api)/);
  return m ? m[1] : null;
};

const applyBtnClass = "tfy-bg-transparent tfy-border tfy-border-accent tfy-text-accent tfy-rounded tfy-py-0.5 tfy-px-2 tfy-cursor-pointer tfy-text-[10px] tfy-whitespace-nowrap tfy-font-mono";

const statusBadge = (evt: RebuildEvent, onReload: () => void) => {
  if (evt.status === "building") {
    return <span className="tfy-text-orange tfy-text-[10px] tfy-font-semibold">building...</span>;
  }
  if (evt.status === "error" && evt.errorType === "compile") {
    return (
      <button
        className="tfy-bg-[#f8514920] tfy-text-red tfy-border tfy-border-[#f8514940] tfy-rounded tfy-py-0.5 tfy-px-2 tfy-cursor-pointer tfy-text-[10px] tfy-whitespace-nowrap tfy-font-mono"
        onClick={onReload}
      >
        Reload
      </button>
    );
  }
  if (evt.status === "error") {
    return <span className="tfy-text-red tfy-text-[10px] tfy-font-semibold">runtime error</span>;
  }
  if (evt.applied) {
    return <span className="tfy-text-green tfy-text-[10px] tfy-font-semibold">applied</span>;
  }
  return null;
};

export const EventLog: React.FC<Props> = ({ events, connected, building, onApply, hasCompileError, compileErrorCount = 0, onShowCompileError }) => {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const currentUser = storage.getUser();

  const toggleError = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const dotColor = hasCompileError ? "#f85149" : building ? "#d29922" : connected ? "#3fb950" : "#f85149";

  return (
    <div className="tfy-mb-3">
      <div className="tfy-flex tfy-items-center tfy-gap-1.5 tfy-text-[10px] tfy-font-semibold tfy-uppercase tfy-text-muted tfy-mb-1 tfy-tracking-[0.5px]">
        <span className="tfy-inline-block tfy-w-[7px] tfy-h-[7px] tfy-rounded-full" style={{ backgroundColor: dotColor }} />
        Changes{" "}
        {hasCompileError ? "(compile error)" : building ? "(building...)" : connected ? "(live)" : "(disconnected)"}
        {(events.length > 0 || hasCompileError) && (
          <span className="tfy-font-normal" style={{ color: hasCompileError ? "#f85149" : "#8b949e" }}>
            ({hasCompileError ? compileErrorCount : events.length})
          </span>
        )}
      </div>

      {hasCompileError && onShowCompileError && (
        <button
          onClick={onShowCompileError}
          className="tfy-flex tfy-items-center tfy-justify-center tfy-gap-1.5 tfy-w-full tfy-rounded-md tfy-py-2 tfy-px-3 tfy-cursor-pointer tfy-text-red tfy-text-[11px] tfy-font-semibold tfy-font-mono tfy-mb-2 tfy-bg-[#f8514912] tfy-border tfy-border-[#f8514930]"
        >
          Compile error detected — Show Details
        </button>
      )}

      <div className="tfy-max-h-[300px] tfy-overflow-y-auto tfy-p-2.5">
        {events.length === 0 || hasCompileError ? (
          <div className="tfy-text-muted tfy-text-center tfy-py-5 tfy-text-[11px]">
            {hasCompileError ? "Fix compilation errors to resume" : "No changes yet"}
          </div>
        ) : (
          <ul className="tfy-list-none tfy-m-0 tfy-p-0">
            {events.map((evt, i) => {
              const isSelf = currentUser && evt.user === currentUser;
              const isBuilding = evt.status === "building";
              const hasError = evt.status === "error";

              return (
                <li
                  key={`${evt.timestamp}-${i}`}
                  className="tfy-flex tfy-justify-between tfy-items-start tfy-py-1.5 tfy-border-b tfy-border-border tfy-gap-2"
                  style={{
                    ...(hasError ? { borderLeft: "3px solid #f85149", paddingLeft: 8 } : {}),
                    ...(isBuilding ? { borderLeft: "3px solid #d29922", paddingLeft: 8 } : {}),
                  }}
                >
                  <div className="tfy-flex-1 tfy-min-w-0">
                    {extractPlugin(evt.file) && (
                      <div className="tfy-text-[10px] tfy-text-muted tfy-mb-px">
                        {extractPlugin(evt.file)}
                      </div>
                    )}

                    <div
                      className="tfy-text-text tfy-break-all tfy-flex-1 tfy-text-[11px]"
                      style={isBuilding ? { color: "#d29922" } : {}}
                    >
                      {shortFile(evt.file)}
                    </div>

                    <div className="tfy-flex tfy-gap-2 tfy-mt-0.5 tfy-items-center">
                      <span className="tfy-font-semibold tfy-text-[11px]" style={{ color: isSelf ? "#3fb950" : "#bc8cff" }}>
                        {evt.user}{isSelf ? " (you)" : ""}
                      </span>
                      <span className="tfy-text-muted tfy-text-[10px] tfy-whitespace-nowrap">
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>

                    {hasError && (
                      <>
                        <button
                          onClick={() => toggleError(i)}
                          className="tfy-bg-transparent tfy-border-0 tfy-text-red tfy-cursor-pointer tfy-text-[10px] tfy-font-mono tfy-py-0.5 tfy-px-0"
                        >
                          {expanded.has(i) ? "- hide error" : "+ show error"}
                        </button>
                        {expanded.has(i) && (
                          <div
                            className="tfy-rounded tfy-p-1.5 tfy-mt-1 tfy-text-red tfy-text-[10px] tfy-max-h-[80px] tfy-overflow-y-auto tfy-whitespace-pre-wrap tfy-break-all tfy-font-mono tfy-bg-[rgba(248,81,73,0.1)] tfy-border tfy-border-[#f8514933]"
                          >
                            {evt.error}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="tfy-shrink-0">
                    {statusBadge(evt, () => window.location.reload()) || (
                      <button className={applyBtnClass} onClick={() => onApply(i)}>
                        Apply
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
