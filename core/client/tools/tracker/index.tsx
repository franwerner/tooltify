import React, { useRef, useState, useCallback, useEffect } from "react";
import { CO, IDE_COLOR } from "../../shared/colors";
import { useInspectMode } from "./hooks/useInspectMode";
import { useClaudeSocket } from "../claude/hooks/useClaudeSocket";
import { TrackerFab } from "./components/TrackerFab";
import { PromptFab } from "../claude/components/PromptFab";
import { InspectModal } from "./components/InspectModal";
import { HoverOverlay } from "./components/HoverOverlay";
import { MiniEditor } from "../editor/components/MiniEditor";
import { EditorFab } from "../editor/components/EditorFab";
import { openSource } from "../../shared/openSource";
import { useActiveTool } from "../../shared/ActiveToolContext";

export const SourceTracker: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { active, setActive, capture, setCapture, close } = useInspectMode(modalRef, fabRef);
  const tool = useActiveTool();

  const showPrompt = tool.activeTool === "claude";
  const [picking, setPicking] = useState(false);
  const [insertReq, setInsertReq] = useState<{ source: string } | null>(null);
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const [editorPicking, setEditorPicking] = useState(false);

  // Sync Editor with active tool
  useEffect(() => {
    if (editorSource) tool.open("editor");
    else tool.close("editor");
  }, [editorSource]);

  // React to active tool changes
  useEffect(() => {
    // Editor shortcut: no file open → activate selector; file open → already showing
    if (tool.activeTool === "editor" && !editorSource) {
      setEditorPicking(true);
    }
    // Close editor when another tool takes over
    if (editorSource && tool.activeTool !== "editor") setEditorSource(null);
    // Always deactivate selectors and inspect on tool change
    setPicking(false);
    if (tool.activeTool !== "editor") setEditorPicking(false);
    setActive(false);
  }, [tool.activeTool, setActive]);

  const claude = useClaudeSocket();

  const togglePrompt = useCallback(() => {
    tool.toggle("claude");
  }, [tool]);

  // Pick mode: mutually exclusive with inspect mode
  const togglePick = useCallback(() => {
    setPicking((v) => {
      if (!v) setActive(false);
      return !v;
    });
  }, [setActive]);

  // When inspect mode activates, deactivate pick and editor pick
  const handleInspectToggle = useCallback(() => {
    setActive((a) => {
      if (!a) { setPicking(false); setEditorPicking(false); }
      return !a;
    });
  }, [setActive]);

  const handleInsertConsumed = useCallback(() => {
    setInsertReq(null);
  }, []);

  // Claude pick mode: crosshair + click element with data-source → insert into prompt
  useEffect(() => {
    if (!picking) return;

    const style = document.createElement("style");
    style.setAttribute("data-claude-pick", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    const isOwnUI = (t: Node) =>
      (t as Element).closest?.("#devtools-portal-root") != null;

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
      if (found) {
        const source = found.getAttribute("data-source")!;
        setInsertReq({ source });
        tool.open("claude");
      }
      setPicking(false);
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicking(false);
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
  }, [picking]);

  // Open source in mini editor
  const handleEdit = useCallback((source: string) => {
    setEditorSource(source);
  }, []);

  // Editor pick mode: click EditorFab → activate selector → click element → open in editor
  const toggleEditorPick = useCallback(() => {
    setEditorPicking((v) => {
      if (!v) { setActive(false); setPicking(false); }
      return !v;
    });
  }, [setActive]);

  // Editor pick: intercept clicks, find data-source, open in editor
  useEffect(() => {
    if (!editorPicking) return;

    const style = document.createElement("style");
    style.setAttribute("data-editor-pick", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    const isOwnUI = (t: Node) =>
      (t as Element).closest?.("#devtools-portal-root") != null;

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
      if (found) {
        const source = found.getAttribute("data-source")!;
        setEditorSource(source);
      }
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

  // Deactivate editor pick when other modes activate
  useEffect(() => {
    if (active || picking) setEditorPicking(false);
  }, [active, picking]);

  const closeEditor = useCallback(() => {
    setEditorSource(null);
  }, []);

  // Also support adding from InspectModal "+" button
  const addToPromptFromModal = useCallback((source: string) => {
    setInsertReq({ source });
    tool.open("claude");
  }, [tool]);

  // Close InspectModal: if Claude is open, just clear capture (don't re-activate inspect)
  const closeInspectModal = useCallback(() => {
    if (showPrompt) {
      setCapture(null);
    } else {
      close();
    }
  }, [showPrompt, setCapture, close]);

  const promptWidgetProps = {
    onClose: togglePrompt,
    connected: claude.connected,
    streaming: claude.streaming,
    blocks: claude.blocks,
    tokens: claude.tokens,
    stats: claude.stats,
    hasSession: claude.hasSession,
    sessionId: claude.sessionId,
    picking,
    insertReq,
    onInsertConsumed: handleInsertConsumed,
    onSend: claude.send,
    onAbort: claude.abort,
    onNewSession: claude.newSession,
    onLoadSession: claude.loadSession,
    onApproveTool: claude.approveTool,
    onRejectTool: claude.rejectTool,
    onApproveAll: claude.approveAll,
    onTogglePick: togglePick,
    dropZoneRef,
  };

  return (
    <>
      {capture ? (
        <div ref={modalRef}>
          <InspectModal
            capture={capture}
            onOpen={openSource}
            onEdit={handleEdit}
            onAddToPrompt={addToPromptFromModal}
            onClose={closeInspectModal}
          />
        </div>
      ) : (
        <div ref={fabRef}>
          <TrackerFab active={active} onToggle={handleInspectToggle} />
          <EditorFab active={editorPicking || !!editorSource} onClick={toggleEditorPick} />
          <PromptFab active={showPrompt} hasContext={picking} onClick={togglePrompt} />
        </div>
      )}
      {!capture && active && <HoverOverlay modalRef={modalRef} fabRef={fabRef} />}
      {editorPicking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={IDE_COLOR} />}
      {picking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={CO} />}
      {editorSource && (
        <MiniEditor source={editorSource} onClose={closeEditor} />
      )}
    </>
  );
};
