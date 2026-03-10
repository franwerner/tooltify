import React from "react";

interface Props {
  onStart: (edge: string, e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onEnd: () => void;
}

const EDGE = 5;

const edges: { edge: string; style: React.CSSProperties }[] = [
  // Sides
  { edge: "n", style: { top: -EDGE, left: EDGE, right: EDGE, height: EDGE * 2, cursor: "ns-resize" } },
  { edge: "s", style: { bottom: -EDGE, left: EDGE, right: EDGE, height: EDGE * 2, cursor: "ns-resize" } },
  { edge: "w", style: { left: -EDGE, top: EDGE, bottom: EDGE, width: EDGE * 2, cursor: "ew-resize" } },
  { edge: "e", style: { right: -EDGE, top: EDGE, bottom: EDGE, width: EDGE * 2, cursor: "ew-resize" } },
  // Corners
  { edge: "nw", style: { top: -EDGE, left: -EDGE, width: EDGE * 3, height: EDGE * 3, cursor: "nwse-resize" } },
  { edge: "ne", style: { top: -EDGE, right: -EDGE, width: EDGE * 3, height: EDGE * 3, cursor: "nesw-resize" } },
  { edge: "sw", style: { bottom: -EDGE, left: -EDGE, width: EDGE * 3, height: EDGE * 3, cursor: "nesw-resize" } },
  { edge: "se", style: { bottom: -EDGE, right: -EDGE, width: EDGE * 3, height: EDGE * 3, cursor: "nwse-resize" } },
];

export const ResizeHandles: React.FC<Props> = ({ onStart, onMove, onEnd }) => (
  <>
    {edges.map(({ edge, style }) => (
      <div
        key={edge}
        style={{ position: "absolute", zIndex: 1, ...style }}
        onPointerDown={(e) => onStart(edge, e)}
        onPointerMove={onMove}
        onPointerUp={onEnd}
      />
    ))}
  </>
);
