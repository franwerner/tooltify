import { useState, useCallback, useRef, useEffect } from "react";

export interface DragResizeState {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Options {
  /** localStorage key for persisting position/size */
  storageKey: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  /** Default position: "center" | "bottom-right" | "bottom-left" | { x, y } */
  defaultPosition?: "center" | "bottom-right" | "bottom-left" | { x: number; y: number };
}

function loadState(key: string): DragResizeState | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(key: string, s: DragResizeState) {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {}
}

function getDefaultPos(
  pos: Options["defaultPosition"],
  w: number,
  h: number,
): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (pos === "center") return { x: (vw - w) / 2, y: (vh - h) / 2 };
  if (pos === "bottom-left") return { x: 16, y: vh - h - 16 };
  if (pos && typeof pos === "object") return pos;
  // bottom-right default
  return { x: vw - w - 16, y: vh - h - 16 };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function useDragResize(opts: Options) {
  const { storageKey, defaultW, defaultH, minW = 200, minH = 150, defaultPosition = "bottom-right" } = opts;

  const [state, setState] = useState<DragResizeState>(() => {
    const saved = loadState(storageKey);
    if (saved) return saved;
    const pos = getDefaultPos(defaultPosition, defaultW, defaultH);
    return { x: pos.x, y: pos.y, w: defaultW, h: defaultH };
  });

  // Persist on change
  useEffect(() => {
    saveState(storageKey, state);
  }, [state, storageKey]);

  // ── Drag ──
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea")) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: state.x, oy: state.y };
  }, [state.x, state.y]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = clamp(d.ox + e.clientX - d.sx, 0, window.innerWidth - state.w);
    const ny = clamp(d.oy + e.clientY - d.sy, 0, window.innerHeight - state.h);
    setState((prev) => ({ ...prev, x: nx, y: ny }));
  }, [state.w, state.h]);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── Resize ──
  const resizeRef = useRef<{
    edge: string;
    sx: number; sy: number;
    ox: number; oy: number;
    ow: number; oh: number;
  } | null>(null);

  const onResizeStart = useCallback((edge: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeRef.current = {
      edge,
      sx: e.clientX, sy: e.clientY,
      ox: state.x, oy: state.y,
      ow: state.w, oh: state.h,
    };
  }, [state]);

  const onResizeMove = useCallback((e: React.PointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    const dx = e.clientX - r.sx;
    const dy = e.clientY - r.sy;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { ox: x, oy: y, ow: w, oh: h } = r;

    if (r.edge.includes("e")) w = clamp(r.ow + dx, minW, vw - x);
    if (r.edge.includes("s")) h = clamp(r.oh + dy, minH, vh - y);
    if (r.edge.includes("w")) {
      const newW = clamp(r.ow - dx, minW, r.ox + r.ow);
      x = r.ox + (r.ow - newW);
      w = newW;
    }
    if (r.edge.includes("n")) {
      const newH = clamp(r.oh - dy, minH, r.oy + r.oh);
      y = r.oy + (r.oh - newH);
      h = newH;
    }

    setState({ x, y, w, h });
  }, [minW, minH]);

  const onResizeEnd = useCallback(() => {
    resizeRef.current = null;
  }, []);

  // Combined style for the container
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    left: state.x,
    top: state.y,
    width: state.w,
    height: state.h,
  };

  return {
    state,
    containerStyle,
    dragHandlers: {
      onPointerDown: onDragStart,
      onPointerMove: onDragMove,
      onPointerUp: onDragEnd,
    },
    resizeHandlers: {
      onStart: onResizeStart,
      onMove: onResizeMove,
      onEnd: onResizeEnd,
    },
  };
}
