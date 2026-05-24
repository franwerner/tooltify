import { useState, useEffect, useCallback } from "react";
import { useCommand } from "../../../shared/keybindings/Keymap";
import { SOURCE_PROPERTY_NAME } from "#common/constant/sourceProperyName.constant";
import { buildFullPath } from "../../../shared/utils/serverMeta";
import type { CapturedTree } from "../types";
import { buildTree, getParentChain } from "../utils/tree";

export function useInspectMode(
  modalRef: React.RefObject<HTMLElement | null>,
  fabRef: React.RefObject<HTMLElement | null>,
  paused: boolean
) {
  const [active, setActive] = useState(false);
  const [capture, setCapture] = useState<CapturedTree | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useCommand("tracker.toggleInspect", () => setActive((v) => !v));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  // When active, set crosshair cursor and intercept clicks
  useEffect(() => {
    if (!active || paused) return;

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

      if (e.altKey) {
        const found = target.closest(`[${SOURCE_PROPERTY_NAME}]`);
        if (found) {
          const path = buildFullPath(found.getAttribute(SOURCE_PROPERTY_NAME)!);
          navigator.clipboard.writeText(path);
          setToast(`Copied: ${path}`);
        } else {
          setToast("No source found");
        }
        setActive(false);
        return;
      }

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
  }, [active, paused, setActive, modalRef]);

  const close = useCallback(() => {
    setCapture(null);
    setActive(true);
  }, [setActive]);

  return { active, setActive, capture, setCapture, close, toast };
}
