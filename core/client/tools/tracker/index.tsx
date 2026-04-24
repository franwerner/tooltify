import React, { useRef, useState, useCallback, useEffect } from "react";
const CO = "#da7756";
const IDE_COLOR = "#3fb950";
import { useInspectMode } from "./hooks/useInspectMode";
import { useEditorPickMode } from "./hooks/useEditorPickMode";
import { TrackerFab } from "./components/TrackerFab";
import { InspectModal } from "./components/InspectModal";
import { HoverOverlay } from "./components/HoverOverlay";
import { MiniEditor } from "../editor";
import { EditorFab } from "../editor/components/EditorFab";
import { openSource } from "../../shared/utils/openSource";
import { loadServerMeta } from "../../shared/utils/serverMeta";
import { useActiveTool } from "../../shared/components/ActiveToolContext";

export const SourceTracker: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const tool = useActiveTool();

  const { active, setActive, capture, close } = useInspectMode(modalRef, fabRef);
  const [picking, setPicking] = useState(false);

  const {
    editorSource,
    editorPicking,
    handleEdit,
    closeEditor,
    toggleEditorPick,
    deactivateEditorPick,
  } = useEditorPickMode(tool, setActive, active);

  // Prefetch server meta (root path) so copy actions are instant
  useEffect(() => {
    loadServerMeta();
  }, []);

  // Reset picking on tool change
  useEffect(() => {
    setPicking(false);
  }, [tool.activeTool]);

  const handleInspectToggle = useCallback(() => {
    setActive((a) => {
      if (!a) { setPicking(false); deactivateEditorPick(); }
      return !a;
    });
  }, [setActive, deactivateEditorPick]);

  const closeInspectModal = useCallback(() => close(), [close]);

  return (
    <>
      {capture ? (
        <div ref={modalRef}>
          <InspectModal
            capture={capture}
            onOpen={openSource}
            onEdit={handleEdit}
            onClose={closeInspectModal}
          />
        </div>
      ) : (
        <div ref={fabRef}>
          <TrackerFab active={active} onToggle={handleInspectToggle} />
          <EditorFab active={editorPicking || !!editorSource} onClick={toggleEditorPick} />
        </div>
      )}
      {!capture && active && <HoverOverlay modalRef={modalRef} fabRef={fabRef} />}
      {editorPicking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={IDE_COLOR} />}
      {picking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={CO} />}
      {editorSource && <MiniEditor source={editorSource} onClose={closeEditor} />}
    </>
  );
};
