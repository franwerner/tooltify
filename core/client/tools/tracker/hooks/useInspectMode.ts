import { useState, useEffect, useCallback } from "react";
import { useKeyboardToggle } from "../../../shared/hooks/useKeyboardToggle";
import type { CapturedTree } from "../types";
import { buildTree, getParentChain } from "../utils/tree";

export function useInspectMode(modalRef: React.RefObject<HTMLElement | null>, fabRef: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useKeyboardToggle("F2", false, true);
  const [capture, setCapture] = useState<CapturedTree | null>(null);

  // When active, set crosshair cursor and intercept clicks
  useEffect(() => {
    if (!active) return;

    // Inject a global style to force crosshair on ALL elements (overrides button cursor:pointer etc.)
    const style = document.createElement("style");
    style.setAttribute("data-tracker", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    const isOwnUI = (t: Node) =>
      (t as Element).closest?.("#devtools-portal-root") != null;

    // Block all pointer events so buttons/links don't activate
    const stop = (e: MouseEvent) => {
      if (isOwnUI(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOwnUI(target)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      setCapture({
        clicked: buildTree(target),
        parents: getParentChain(target),
      });
      setActive(false);
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(false);
      }
    };

    window.addEventListener("mousedown", stop, true);
    window.addEventListener("mouseup", stop, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("pointerdown", stop, true);
    window.addEventListener("keydown", onEscape, true);
    return () => {
      window.removeEventListener("mousedown", stop, true);
      window.removeEventListener("mouseup", stop, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("pointerdown", stop, true);
      window.removeEventListener("keydown", onEscape, true);
      style.remove();
    };
  }, [active, setActive, modalRef]);

  const close = useCallback(() => {
    setCapture(null);
    setActive(true);
  }, [setActive]);

  return { active, setActive, capture, setCapture, close };
}
