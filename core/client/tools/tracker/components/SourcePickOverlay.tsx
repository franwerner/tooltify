import { useEffect, useRef, useCallback } from "react";
import { CO, CO_DIM } from "../../../shared/colors";

interface Props {
  excludeRefs: React.RefObject<HTMLElement | null>[];
  dropZoneRef: React.RefObject<HTMLElement | null>;
  onDrop: (source: string) => void;
  onDeactivate: () => void;
}

export const SourcePickOverlay: React.FC<Props> = ({ excludeRefs, dropZoneRef, onDrop, onDeactivate }) => {
  const highlightRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lastEl = useRef<Element | null>(null);

  const isExcluded = useCallback(
    (t: Node) => excludeRefs.some((r) => r.current?.contains(t)),
    [excludeRefs]
  );

  useEffect(() => {
    const highlight = highlightRef.current;
    const label = labelRef.current;
    if (!highlight || !label) return;

    // Crosshair cursor
    const style = document.createElement("style");
    style.setAttribute("data-source-pick", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    // ── Drag state ──
    let dragSource: string | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let ghostPill: HTMLDivElement | null = null;
    let isDragging = false;
    const DRAG_THRESHOLD = 5;

    const hide = () => {
      highlight.style.display = "none";
      label.style.display = "none";
      lastEl.current = null;
    };

    const isOverDropZone = (x: number, y: number) => {
      const el = dropZoneRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const createGhost = (source: string, x: number, y: number) => {
      const pill = document.createElement("div");
      pill.style.cssText = [
        "position:fixed", "pointer-events:none", "z-index:10000000",
        "background:#1a1d23", `color:${CO}`,
        "font-size:11px", "font-family:'JetBrains Mono',monospace",
        "padding:3px 10px", "border-radius:4px",
        `border:1px solid ${CO}60`,
        "white-space:nowrap", "box-shadow:0 4px 16px rgba(0,0,0,0.5)",
        `top:${y - 24}px`, `left:${x}px`,
        "transition:background 0.1s, border-color 0.1s, color 0.1s",
      ].join(";");
      pill.textContent = `[${source}]`;
      document.body.appendChild(pill);
      return pill;
    };

    const removeGhost = () => {
      if (ghostPill) { ghostPill.remove(); ghostPill = null; }
    };

    const setDropIndicator = (on: boolean) => {
      const el = dropZoneRef.current;
      if (!el) return;
      el.style.outline = on ? `2px solid ${CO}` : "";
      el.style.outlineOffset = on ? "-2px" : "";
    };

    // ── Hover (only when NOT dragging) ──
    const positionLabel = (rect: DOMRect, source: string) => {
      label.textContent = source;
      label.style.display = "block";
      const lr = label.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const gap = 4;
      let top = rect.top > lr.height + gap
        ? rect.top - lr.height - gap
        : rect.bottom + lr.height + gap < vh
          ? rect.bottom + gap
          : Math.max(gap, Math.min(vh - lr.height - gap, rect.top));
      let left = rect.left;
      if (left + lr.width > vw - gap) left = vw - lr.width - gap;
      if (left < gap) left = gap;
      label.style.top = `${top}px`;
      label.style.left = `${left}px`;
    };

    const onMouseMove = (e: MouseEvent) => {
      // ── During drag: move ghost ──
      if (dragSource) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (!isDragging && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          isDragging = true;
          ghostPill = createGhost(dragSource, e.clientX, e.clientY);
          hide();
        }
        if (isDragging && ghostPill) {
          ghostPill.style.top = `${e.clientY - 24}px`;
          ghostPill.style.left = `${e.clientX}px`;
          const over = isOverDropZone(e.clientX, e.clientY);
          setDropIndicator(over);
          ghostPill.style.background = over ? "#1a2d1a" : "#1a1d23";
          ghostPill.style.borderColor = over ? "#3fb950" : `${CO}60`;
          ghostPill.style.color = over ? "#3fb950" : CO;
        }
        return;
      }

      // ── Normal hover ──
      const target = e.target as Element;
      if (isExcluded(target)) { hide(); return; }
      const found = target.closest("[data-source]");
      if (!found || isExcluded(found)) { hide(); return; }
      if (found === lastEl.current) return;
      lastEl.current = found;

      const rect = found.getBoundingClientRect();
      highlight.style.display = "block";
      highlight.style.top = `${rect.top}px`;
      highlight.style.left = `${rect.left}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      positionLabel(rect, found.getAttribute("data-source") || "");
    };

    // ── Pointer down: start drag ──
    const onPointerDown = (e: PointerEvent) => {
      if (isExcluded(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as Element;
      const found = target.closest("[data-source]");
      if (found) {
        dragSource = found.getAttribute("data-source");
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        isDragging = false;
      }
    };

    // ── Pointer up: finish drag or quick-click ──
    const onPointerUp = (e: PointerEvent) => {
      if (isExcluded(e.target as Node)) {
        dragSource = null; isDragging = false;
        removeGhost(); setDropIndicator(false);
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      if (dragSource) {
        if (isDragging) {
          // Drag: check drop zone
          if (isOverDropZone(e.clientX, e.clientY)) {
            onDrop(dragSource);
          }
        } else {
          // Quick click: insert directly
          onDrop(dragSource);
        }
      }

      dragSource = null; isDragging = false;
      removeGhost(); setDropIndicator(false);
    };

    // Block click navigation (links, buttons)
    const blockClick = (e: MouseEvent) => {
      if (isExcluded(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dragSource = null; isDragging = false;
        removeGhost(); setDropIndicator(false);
        onDeactivate();
      }
    };

    window.addEventListener("mousemove", onMouseMove, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("click", blockClick, true);
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("mousemove", onMouseMove, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("click", blockClick, true);
      window.removeEventListener("keydown", onKey, true);
      style.remove();
      removeGhost();
      setDropIndicator(false);
      hide();
    };
  }, [isExcluded, dropZoneRef, onDrop, onDeactivate]);

  return (
    <>
      <div
        ref={highlightRef}
        style={{
          display: "none",
          position: "fixed",
          pointerEvents: "none",
          zIndex: 999997,
          border: `2px solid ${CO}`,
          background: `${CO}20`,
          borderRadius: 3,
          transition: "top 0.05s, left 0.05s, width 0.05s, height 0.05s",
        }}
      />
      <div
        ref={labelRef}
        style={{
          display: "none",
          position: "fixed",
          pointerEvents: "none",
          zIndex: 999997,
          background: "#1a1d23",
          color: CO,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: "2px 8px",
          borderRadius: 4,
          border: `1px solid ${CO}60`,
          whiteSpace: "nowrap",
          maxWidth: "80vw",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "18px",
        }}
      />
    </>
  );
};
