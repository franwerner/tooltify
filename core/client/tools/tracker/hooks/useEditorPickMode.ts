import { useState, useEffect, useCallback } from "react";
import type { useActiveTool } from "../../../shared/components/ActiveToolContext";

const isOwnUI = (t: Node) =>
  (t as Element).closest?.("#devtools-portal-root") != null;

export function useEditorPickMode(
  tool: ReturnType<typeof useActiveTool>,
  setActive: (v: boolean) => void,
  active: boolean
) {
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const [editorPicking, setEditorPicking] = useState(false);

  // Sync editor tool open/close with editorSource
  useEffect(() => {
    if (editorSource) tool.open("editor");
    else tool.close("editor");
  }, [editorSource]);

  // React to active tool changes
  useEffect(() => {
    if (tool.activeTool === "editor" && !editorSource) setEditorPicking(true);
    if (editorSource && tool.activeTool !== "editor") setEditorSource(null);
    if (tool.activeTool !== "editor") setEditorPicking(false);
    setActive(false);
  }, [tool.activeTool, setActive]);

  // Crosshair cursor + click-to-pick when editorPicking
  useEffect(() => {
    if (!editorPicking) return;

    const style = document.createElement("style");
    style.setAttribute("data-editor-pick", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

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

      const found = target.closest("[data-source]");
      if (found) setEditorSource(found.getAttribute("data-source")!);
      setEditorPicking(false);
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditorPicking(false);
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
  }, [editorPicking]);

  // Deactivate editor pick when inspect mode activates
  useEffect(() => {
    if (active) setEditorPicking(false);
  }, [active]);

  const handleEdit = useCallback((source: string) => setEditorSource(source), []);
  const closeEditor = useCallback(() => setEditorSource(null), []);

  const toggleEditorPick = useCallback(() => {
    setEditorPicking((v) => {
      if (!v) setActive(false);
      return !v;
    });
  }, [setActive]);

  const deactivateEditorPick = useCallback(() => setEditorPicking(false), []);

  return {
    editorSource,
    editorPicking,
    handleEdit,
    closeEditor,
    toggleEditorPick,
    deactivateEditorPick,
  };
}
