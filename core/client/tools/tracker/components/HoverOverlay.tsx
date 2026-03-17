import { useEffect, useRef, useCallback } from "react";

interface Props {
  modalRef: React.RefObject<HTMLElement | null>;
  fabRef: React.RefObject<HTMLElement | null>;
  color?: string;
}

const isDevtoolsUI = (t: Node) =>
  (t as Element).closest?.("#devtools-portal-root") != null;

export const HoverOverlay: React.FC<Props> = ({ modalRef, fabRef, color = "#58a6ff" }) => {
  const highlightRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const lastEl = useRef<Element | null>(null);

  const isOwnUI = useCallback(
    (t: Node) => isDevtoolsUI(t),
    []
  );

  useEffect(() => {
    const highlight = highlightRef.current;
    const label = labelRef.current;
    if (!highlight || !label) return;

    const hide = () => {
      highlight.style.display = "none";
      label.style.display = "none";
      lastEl.current = null;
    };

    const onMove = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOwnUI(target)) {
        hide();
        return;
      }

      const found = target.closest("[tooltify_source]");
      if (!found || isOwnUI(found)) {
        hide();
        return;
      }

      if (found === lastEl.current) return;
      lastEl.current = found;

      const rect = found.getBoundingClientRect();
      highlight.style.display = "block";
      highlight.style.top = `${rect.top}px`;
      highlight.style.left = `${rect.left}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;

      const source = found.getAttribute("tooltify_source") || "";
      label.textContent = source;
      label.style.display = "block";

      // Measure label to position it properly
      const labelRect = label.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const lw = labelRect.width;
      const lh = labelRect.height;
      const gap = 4;

      // Vertical: prefer above, then below, then clamp inside viewport
      let top: number;
      if (rect.top > lh + gap) {
        top = rect.top - lh - gap;
      } else if (rect.bottom + lh + gap < vh) {
        top = rect.bottom + gap;
      } else {
        top = Math.max(gap, Math.min(vh - lh - gap, rect.top));
      }

      // Horizontal: start at element left, clamp to viewport
      let left = rect.left;
      if (left + lw > vw - gap) {
        left = vw - lw - gap;
      }
      if (left < gap) {
        left = gap;
      }

      label.style.top = `${top}px`;
      label.style.left = `${left}px`;
    };

    window.addEventListener("mousemove", onMove, true);
    return () => {
      window.removeEventListener("mousemove", onMove, true);
    };
  }, [isOwnUI]);

  return (
    <>
      <div
        ref={highlightRef}
        className="tfy-fixed tfy-pointer-events-none tfy-z-[999997] tfy-rounded tfy-transition-[top,left,width,height] tfy-duration-[50ms]"
        style={{ display: "none", border: `2px solid ${color}`, background: `${color}18` }}
      />
      <div
        ref={labelRef}
        className="tfy-fixed tfy-pointer-events-none tfy-z-[999997] tfy-bg-surface tfy-text-[11px] tfy-font-mono tfy-py-0.5 tfy-px-2 tfy-rounded tfy-border tfy-border-border tfy-whitespace-nowrap tfy-max-w-[80vw] tfy-overflow-hidden tfy-text-ellipsis tfy-leading-[18px]"
        style={{ display: "none", color }}
      />
    </>
  );
};
