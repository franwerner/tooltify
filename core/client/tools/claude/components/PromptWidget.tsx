import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { COLORS, TERM, CO, CO_DIM, CO_MED } from "../../../shared/colors";
import { openSource } from "../../../shared/openSource";
import type { CSSProperties } from "react";
import type { MessageBlock, TokenUsage, RunStats } from "../hooks/useClaudeSocket";
import { useDragResize } from "../../../shared/useDragResize";
import { ResizeHandles } from "../../../shared/ResizeHandles";

interface Props {
  onClose: () => void;
  connected: boolean;
  streaming: boolean;
  blocks: MessageBlock[];
  tokens: TokenUsage;
  stats: RunStats | null;
  hasSession: boolean;
  sessionId: string | null;
  picking: boolean;
  insertReq: { source: string } | null;
  onInsertConsumed: () => void;
  onSend: (sources: string[], instruction: string) => void;
  onAbort: () => void;
  onNewSession: () => void;
  onLoadSession: (id: string) => void;
  onApproveTool: (id: string) => void;
  onRejectTool: (id: string) => void;
  onApproveAll: () => void;
  onTogglePick: () => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
}

/* ── styles ── */
const base: CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: 12,
  color: COLORS.text,
};

const s: Record<string, CSSProperties> = {
  panel: {
    ...base, position: "fixed",
    background: TERM.bg, border: `1px solid ${TERM.border}`, borderRadius: 10,
    zIndex: 9999998, display: "flex", flexDirection: "column", overflow: "hidden",
    boxShadow: `0 0 0 1px ${CO_DIM}, 0 12px 48px rgba(0,0,0,0.6)`,
  },
  titleBar: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
    background: TERM.surface, borderBottom: `1px solid ${TERM.border}`, userSelect: "none",
  },
  titleDots: { display: "flex", gap: 5 },
  titleText: {
    flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600,
    color: COLORS.muted, letterSpacing: "0.5px",
  },
  titleBtnGroup: { display: "flex", gap: 4 },
  titleBtn: {
    background: "none", border: "none", color: COLORS.muted, cursor: "pointer",
    fontSize: 15, padding: 0, lineHeight: 1, width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4,
  },
  terminal: {
    flex: 1, overflow: "auto", padding: "12px 14px", minHeight: 60,
    background: TERM.bg,
  },
  line: { margin: 0, padding: 0, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  promptPrefix: { color: CO, fontWeight: 700, userSelect: "none" },
  claudePrefix: { color: CO, fontWeight: 700, userSelect: "none" },
  cursor: { display: "inline-block", width: 7, height: 14, background: CO, verticalAlign: "text-bottom", marginLeft: 2 },
  inputRow: {
    display: "flex", alignItems: "flex-end", gap: 0, padding: "8px 14px 10px",
    borderTop: `1px solid ${TERM.border}`, background: TERM.surface,
  },
  inputPrefix: {
    color: CO, fontWeight: 700, fontSize: 13, lineHeight: "24px",
    userSelect: "none", paddingRight: 8, flexShrink: 0,
  },
  editable: {
    flex: 1, minHeight: 20, maxHeight: 100, overflowY: "auto",
    color: COLORS.text, padding: "2px 0", fontSize: 12, fontFamily: "inherit",
    outline: "none", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
  btn: {
    border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 6,
  },
  statusBar: {
    display: "flex", alignItems: "center", gap: 6, padding: "4px 14px 5px",
    borderTop: `1px solid ${TERM.border}`, background: TERM.surface, fontSize: 10, color: COLORS.muted,
  },
};

/* ── tool block styles ── */
const toolStyles: Record<string, CSSProperties> = {
  wrapper: {
    margin: "4px 0", borderLeft: `2px solid ${TERM.border}`, paddingLeft: 10, marginLeft: 2,
  },
  header: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.muted, lineHeight: 1.6,
  },
  toolName: { color: CO, fontWeight: 600 },
  spinner: { color: CO_MED, fontSize: 10 },
  result: {
    fontSize: 10, color: "#484f58", lineHeight: 1.4, maxHeight: 60, overflow: "hidden",
    whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 2,
  },
};

/* ── code block styles ── */
const codeStyles: Record<string, CSSProperties> = {
  block: {
    background: TERM.surface, border: `1px solid ${TERM.border}`, borderRadius: 6,
    padding: "8px 10px", margin: "6px 0", fontSize: 11, lineHeight: 1.5,
    overflowX: "auto", whiteSpace: "pre", fontFamily: "'JetBrains Mono', monospace",
  },
  lang: {
    fontSize: 9, color: "#484f58", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px",
  },
  inline: {
    background: TERM.surface, padding: "1px 5px", borderRadius: 3, fontSize: 11,
    border: `1px solid ${TERM.border}`, fontFamily: "'JetBrains Mono', monospace",
  },
};

/* ── stats row ── */
const statsStyle: CSSProperties = {
  display: "flex", gap: 12, fontSize: 10, color: "#484f58", padding: "6px 0 2px",
  borderTop: `1px solid ${TERM.border}15`, marginTop: 6,
};

/* ── inject global styles for source tags + placeholder + cursor blink + ctrl links ── */
const STYLE_ID = "claude-prompt-styles";
const ensureStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
.claude-edit:empty::before{content:attr(data-placeholder);color:${COLORS.muted};pointer-events:none;font-style:italic}
.claude-edit .stag{color:${CO};font-weight:600;background:${CO}18;border-radius:3px;padding:0 4px;margin:0 1px;cursor:default;white-space:nowrap;user-select:all;text-decoration:none}
.claude-edit .stag:hover{background:${CO}30}
.claude-edit .stag.pd{outline:1.5px solid ${CO};background:${CO}40}
.slink{color:${CO};cursor:default;text-decoration:none}
.claude-panel.ctrl-held{user-select:none}
.claude-panel.ctrl-held .slink,.claude-panel.ctrl-held .stag{cursor:pointer;text-decoration:underline;user-select:none}
@keyframes claudeBlink{0%,50%{opacity:1}51%,100%{opacity:0}}
@keyframes claudeSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(el);
};

/* ── extract content from contentEditable DOM ── */
function extractFromDom(root: HTMLElement): { text: string; sources: string[] } {
  const sources: string[] = [];
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node instanceof HTMLElement) {
      if (node.classList.contains("stag")) {
        const src = node.getAttribute("data-src") || "";
        if (src) sources.push(src);
        return `[${src}]`;
      }
      if (node.tagName === "BR") return "\n";
      if (node.tagName === "DIV" || node.tagName === "P") {
        const inner = Array.from(node.childNodes).map(walk).join("");
        return (node.previousSibling ? "\n" : "") + inner;
      }
      return Array.from(node.childNodes).map(walk).join("");
    }
    return "";
  };
  const text = Array.from(root.childNodes).map(walk).join("").trim();
  return { text, sources };
}

/* ── create a source tag span element ── */
function makeSourceSpan(source: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "stag";
  span.setAttribute("data-src", source);
  span.contentEditable = "false";
  span.textContent = source;
  return span;
}

/* ── insert a source span at the current cursor in a contentEditable ── */
function insertSourceAtCursor(root: HTMLElement, source: string) {
  root.focus();
  const sel = window.getSelection();
  let range: Range;

  if (sel && sel.rangeCount > 0 && root.contains(sel.anchorNode)) {
    range = sel.getRangeAt(0);
    range.deleteContents();
  } else {
    range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
  }

  const span = makeSourceSpan(source);
  range.insertNode(span);

  const space = document.createTextNode("\u00A0");
  span.after(space);

  range.setStartAfter(space);
  range.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

/* ── format numbers ── */
function fmtTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function fmtCost(usd: number): string {
  if (usd < 0.01) return "<$0.01";
  return "$" + usd.toFixed(2);
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return ms + "ms";
  return (ms / 1000).toFixed(1) + "s";
}

/* ── widget config removed — now uses shared useDragResize ── */

/* ── conversation storage (localStorage) ── */
const CONVOS_KEY = "claude-conversations";
const MAX_CONVOS = 30;

interface HistoryEntry {
  role: "user" | "claude";
  text?: string;
  blocks?: MessageBlock[];
  tokens?: TokenUsage;
  stats?: RunStats | null;
}

interface SavedConvo {
  id: string;        // sessionId
  title: string;     // first user message, truncated
  ts: number;        // timestamp
  entries: HistoryEntry[];
}

function loadConvos(): SavedConvo[] {
  try { const r = localStorage.getItem(CONVOS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveConvos(list: SavedConvo[]) {
  try { localStorage.setItem(CONVOS_KEY, JSON.stringify(list.slice(0, MAX_CONVOS))); } catch {}
}
function convoTitle(entries: HistoryEntry[]): string {
  const first = entries.find((e) => e.role === "user");
  const raw = first?.text || "New conversation";
  return raw.length > 60 ? raw.slice(0, 57) + "..." : raw;
}

/* ── Render text with basic markdown: code blocks and inline code ── */
function renderMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Split by fenced code blocks
  const codeBlockRe = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = codeBlockRe.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(...renderInlineCode(text.slice(last, m.index), key));
      key += 100;
    }
    const lang = m[1];
    const code = m[2].replace(/\n$/, "");
    parts.push(
      <div key={`cb-${key++}`} style={codeStyles.block}>
        {lang && <div style={codeStyles.lang}>{lang}</div>}
        <code>{code}</code>
      </div>
    );
    last = codeBlockRe.lastIndex;
  }

  if (last < text.length) {
    parts.push(...renderInlineCode(text.slice(last), key));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderInlineCode(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = startKey;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(renderSourceLinks(text.slice(last, m.index), k));
    k += 10;
    parts.push(<code key={`ic-${k++}`} style={codeStyles.inline}>{m[1]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(renderSourceLinks(text.slice(last), k));
  return parts;
}

/* ── Render [source:line] as clickable links ── */
function renderSourceLinks(text: string, key: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = /\[([^\]\s]+:\d+)\]/g;
  let m: RegExpExecArray | null;
  let k = key;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const src = m[1];
    parts.push(
      <span
        key={`sl-${k++}`}
        className="slink"
        data-src={src}
        style={{ fontWeight: 600 }}
        title="Ctrl+Click to open"
      >
        [{src}]
      </span>
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return text;
  return <React.Fragment key={`sf-${key}`}>{parts}</React.Fragment>;
}

/* ── Pending tool approval button styles ── */
const approvalStyles: Record<string, CSSProperties> = {
  btnGroup: { marginLeft: "auto", display: "flex", gap: 4, flexShrink: 0 },
  acceptBtn: {
    background: "#23803010", color: "#3fb950", border: "1px solid #3fb95050",
    borderRadius: 3, padding: "1px 8px", fontSize: 10, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", lineHeight: "18px",
  },
  rejectBtn: {
    background: "#f8514910", color: "#f85149", border: "1px solid #f8514950",
    borderRadius: 3, padding: "1px 8px", fontSize: 10, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", lineHeight: "18px",
  },
  acceptAllBtn: {
    background: "#23803015", color: "#3fb950", border: "1px solid #3fb95040",
    borderRadius: 4, padding: "3px 12px", fontSize: 10, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", lineHeight: "16px",
    display: "flex", alignItems: "center", gap: 4, margin: "4px 0 4px 12px",
  },
  pendingInput: {
    fontSize: 10, color: COLORS.muted, lineHeight: 1.4, maxHeight: 80, overflow: "hidden",
    whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: 2, paddingLeft: 2,
  },
};

/* ── Render a tool block ── */
const ToolBlockView: React.FC<{
  block: Extract<MessageBlock, { type: "tool" }>;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}> = ({ block, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);

  // ── Pending approval state ──
  if (block.pending) {
    return (
      <div style={{ ...toolStyles.wrapper, borderLeftColor: "#d29922" }}>
        <div style={toolStyles.header}>
          <span style={{ color: "#d29922", fontSize: 10 }}>⏳</span>
          <span style={toolStyles.toolName}>{block.tool}</span>
          {block.file && (
            <span className="slink" data-src={block.file} style={{ fontSize: 10 }} title="Ctrl+Click to open">
              {block.file}
            </span>
          )}
          <div style={approvalStyles.btnGroup}>
            <button style={approvalStyles.acceptBtn} onClick={() => onApprove?.(block.id)} title="Allow this tool">
              ✓ Accept
            </button>
            <button style={approvalStyles.rejectBtn} onClick={() => onReject?.(block.id)} title="Block and abort">
              ✗ Reject
            </button>
          </div>
        </div>
        {block.input && (
          <div style={approvalStyles.pendingInput}>{block.input}</div>
        )}
      </div>
    );
  }

  // ── Normal state (running / done) ──
  const icon = block.done ? "✓" : "⟳";
  const iconColor = block.done ? "#3fb950" : CO_MED;

  return (
    <div style={toolStyles.wrapper}>
      <div
        style={{ ...toolStyles.header, cursor: block.result ? "pointer" : "default" }}
        onClick={() => block.result && setExpanded((v) => !v)}
      >
        <span style={{
          color: iconColor, fontSize: 10,
          ...(block.done ? {} : { animation: "claudeSpin 1s linear infinite", display: "inline-block" }),
        }}>
          {icon}
        </span>
        <span style={toolStyles.toolName}>{block.tool}</span>
        {block.file && (
          <span
            className="slink"
            data-src={block.file}
            style={{ fontSize: 10 }}
            title="Ctrl+Click to open"
          >
            {block.file}
          </span>
        )}
        {block.result && (
          <span style={{ fontSize: 9, color: "#484f58", marginLeft: "auto" }}>
            {expanded ? "▾" : "▸"}
          </span>
        )}
      </div>
      {expanded && block.result && (
        <div style={toolStyles.result}>{block.result}</div>
      )}
    </div>
  );
};

/* ── Render message blocks (streaming or archived) ── */
const BlocksView: React.FC<{
  blocks: MessageBlock[];
  isStreaming?: boolean;
  tokens?: TokenUsage;
  stats?: RunStats | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onApproveAll?: () => void;
}> = ({ blocks, isStreaming, tokens, stats, onApprove, onReject, onApproveAll }) => {
  const pendingCount = blocks.filter((b) => b.type === "tool" && b.pending).length;

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "text") {
          return (
            <div key={i} style={s.line}>
              {i === 0 && <span style={s.claudePrefix}>✦ </span>}
              <span>{renderMarkdown(block.content)}</span>
              {isStreaming && i === blocks.length - 1 && (
                <span style={{ ...s.cursor, animation: "claudeBlink 1s step-end infinite" }} />
              )}
            </div>
          );
        }
        if (block.type === "tool") {
          return <ToolBlockView key={i} block={block} onApprove={onApprove} onReject={onReject} />;
        }
        return null;
      })}
      {pendingCount > 1 && onApproveAll && (
        <button style={approvalStyles.acceptAllBtn} onClick={onApproveAll}>
          ✓ Accept all ({pendingCount})
        </button>
      )}
      {stats && (
        <div style={statsStyle}>
          <span style={{ color: CO_MED }}>{fmtCost(stats.cost)}</span>
          <span>{fmtDuration(stats.duration)}</span>
          {stats.turns > 1 && <span>{stats.turns} turns</span>}
          {tokens && tokens.input > 0 && (
            <span style={{ marginLeft: "auto" }}>{fmtTokens(tokens.input + tokens.output)} tokens</span>
          )}
        </div>
      )}
    </>
  );
};

/* ── component ── */
export const PromptWidget: React.FC<Props> = ({
  onClose, connected, streaming, blocks, tokens, stats, hasSession, sessionId, picking,
  insertReq, onInsertConsumed, onSend, onAbort, onNewSession, onLoadSession,
  onApproveTool, onRejectTool, onApproveAll, onTogglePick, dropZoneRef,
}) => {
  const { containerStyle, dragHandlers, resizeHandlers } = useDragResize({
    storageKey: "claude-widget-cfg",
    defaultW: 480,
    defaultH: 520,
    minW: 300,
    minH: 250,
    defaultPosition: "bottom-right",
  });

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasContent, setHasContent] = useState(false);
  const [ctrlHeld, setCtrlHeld] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [convos, setConvos] = useState<SavedConvo[]>(loadConvos);
  const editableRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const prevStreamingRef = useRef(false);
  const pendingDel = useRef<HTMLElement | null>(null);

  useEffect(ensureStyles, []);

  // Track Ctrl key for link hover behavior
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(false); };
    const blur = () => setCtrlHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [blocks, history]);

  // Archive response when streaming ends
  useEffect(() => {
    if (prevStreamingRef.current && !streaming && blocks.length > 0) {
      setHistory((h) => [...h, { role: "claude", blocks: [...blocks], tokens: { ...tokens }, stats }]);
    }
    prevStreamingRef.current = streaming;
  }, [streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  // Insert source from pick overlay
  useEffect(() => {
    if (!insertReq) return;
    const el = editableRef.current;
    if (el) {
      insertSourceAtCursor(el, insertReq.source);
      setHasContent(true);
    }
    onInsertConsumed();
  }, [insertReq]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSend = connected && hasContent && !streaming;

  const handleSend = useCallback(() => {
    const el = editableRef.current;
    if (!el || !canSend) return;
    const { text, sources } = extractFromDom(el);
    if (!text) return;
    setHistory((h) => [...h, { role: "user", text }]);
    el.innerHTML = "";
    setHasContent(false);
    onSend(sources, text);
  }, [canSend, onSend]);

  // ── Save current conversation to localStorage ──
  const saveCurrentConvo = useCallback((h: HistoryEntry[], sid: string | null) => {
    if (h.length === 0) return;
    const id = sid || `local-${Date.now()}`;
    setConvos((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      const next: SavedConvo[] = [{ id, title: convoTitle(h), ts: Date.now(), entries: h }, ...filtered];
      saveConvos(next);
      return next;
    });
  }, []);

  // Auto-save when streaming finishes (after archiving the response)
  const prevSessionRef = useRef<string | null>(null);
  useEffect(() => { prevSessionRef.current = sessionId; }, [sessionId]);

  // Save when a response finishes streaming
  useEffect(() => {
    if (prevStreamingRef.current && !streaming && history.length > 0) {
      saveCurrentConvo(history, sessionId);
    }
  }, [streaming, history.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewSession = useCallback(() => {
    // Save current before clearing
    saveCurrentConvo(history, sessionId);
    setHistory([]);
    if (editableRef.current) editableRef.current.innerHTML = "";
    setHasContent(false);
    setShowHistory(false);
    onNewSession();
  }, [onNewSession, history, sessionId, saveCurrentConvo]);

  // ── Load a saved conversation ──
  const handleLoadConvo = useCallback((convo: SavedConvo) => {
    // Save current first
    saveCurrentConvo(history, sessionId);
    // Load selected
    setHistory(convo.entries);
    setShowHistory(false);
    onLoadSession(convo.id);
  }, [history, sessionId, saveCurrentConvo, onLoadSession]);

  // ── Delete a saved conversation ──
  const handleDeleteConvo = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConvos((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConvos(next);
      return next;
    });
  }, []);

  // ── Keyboard handling ──
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter → send, Shift+Enter → newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (e.key === "Backspace") {
      const sel = window.getSelection();
      if (!sel) return;

      if (pendingDel.current) {
        const pd = pendingDel.current;
        pendingDel.current = null;
        requestAnimationFrame(() => {
          if (pd.parentNode) pd.remove();
          setHasContent(!!editableRef.current?.textContent?.trim());
        });
        return;
      }

      if (sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        let prevSpan: HTMLElement | null = null;

        if (node.nodeType === Node.TEXT_NODE && offset === 0) {
          const prev = node.previousSibling;
          if (prev instanceof HTMLElement && prev.classList.contains("stag")) prevSpan = prev;
        } else if (node.nodeType === Node.ELEMENT_NODE && offset > 0) {
          const child = node.childNodes[offset - 1];
          if (child instanceof HTMLElement && child.classList.contains("stag")) prevSpan = child;
        }

        if (prevSpan) {
          e.preventDefault();
          prevSpan.classList.add("pd");
          pendingDel.current = prevSpan;
          const r = document.createRange();
          r.selectNode(prevSpan);
          sel.removeAllRanges();
          sel.addRange(r);
          return;
        }
      }
      return;
    }

    if (pendingDel.current) {
      pendingDel.current.classList.remove("pd");
      pendingDel.current = null;
    }
  }, [handleSend]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (pendingDel.current) {
      pendingDel.current.classList.remove("pd");
      pendingDel.current = null;
    }
    if (e.ctrlKey || e.metaKey) {
      const target = e.target as HTMLElement;
      if (target.classList.contains("stag")) {
        e.preventDefault();
        const src = target.getAttribute("data-src");
        if (src) openSource(src);
      }
    }
  }, []);

  const handleInput = useCallback(() => {
    setHasContent(!!editableRef.current?.textContent?.trim());
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const hoverBtn = (e: React.MouseEvent, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.background = enter ? TERM.border : "none";
  };

  const placeholder = picking
    ? "Pick sources from page, then type here..."
    : connected
      ? "Describe your changes... (pick ⊕ to add files)"
      : "Connecting...";

  // Token counter text for status bar
  const tokenText = useMemo(() => {
    if (!streaming && tokens.input === 0) return "";
    const parts: string[] = [];
    if (tokens.input > 0) parts.push(`↓${fmtTokens(tokens.input)}`);
    if (tokens.output > 0) parts.push(`↑${fmtTokens(tokens.output)}`);
    if (tokens.cacheRead > 0) parts.push(`cache:${fmtTokens(tokens.cacheRead)}`);
    return parts.join(" ");
  }, [streaming, tokens]);

  return (
    <div className={`claude-panel${ctrlHeld ? " ctrl-held" : ""}`} style={{ ...s.panel, ...containerStyle }}>
      <ResizeHandles {...resizeHandlers} />
      {/* ── Title bar (draggable) ── */}
      <div
        style={{ ...s.titleBar, cursor: "grab", position: "relative" }}
        {...dragHandlers}
      >
        <div style={s.titleDots}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f85149", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#d29922", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3fb950", display: "inline-block" }} />
        </div>
        <span style={s.titleText}>
          claude code
          {hasSession && <span style={{ color: CO, marginLeft: 6, fontSize: 9 }}>● session</span>}
        </span>
        <div style={s.titleBtnGroup}>
          <button
            style={{ ...s.titleBtn, opacity: hasSession || history.length > 0 ? 1 : 0.3 }}
            onClick={handleNewSession}
            onMouseEnter={(e) => hoverBtn(e, true)}
            onMouseLeave={(e) => hoverBtn(e, false)}
            title="New session"
            disabled={streaming}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {/* History */}
          <button
            style={{ ...s.titleBtn, color: showHistory ? CO : COLORS.muted, opacity: convos.length > 0 || showHistory ? 1 : 0.3 }}
            onClick={() => { setShowHistory((v) => !v); setShowSettings(false); }}
            onMouseEnter={(e) => hoverBtn(e, true)}
            onMouseLeave={(e) => hoverBtn(e, false)}
            title="Conversation history"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button style={s.titleBtn} onClick={onClose}
            onMouseEnter={(e) => hoverBtn(e, true)} onMouseLeave={(e) => hoverBtn(e, false)}
          >&times;</button>
        </div>

        {/* ── Settings dropdown ── */}
      </div>

      {/* ── History list view ── */}
      {showHistory ? (
        <div style={{ ...s.terminal, padding: "8px 10px" }}>
          {convos.length === 0 ? (
            <div style={{ color: COLORS.muted, fontSize: 11, textAlign: "center", padding: "24px 0" }}>
              No saved conversations yet
            </div>
          ) : convos.map((c) => (
            <div
              key={c.id}
              onClick={() => handleLoadConvo(c)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 2,
                borderRadius: 6, cursor: "pointer", border: `1px solid transparent`,
                background: sessionId === c.id ? `${CO}12` : "transparent",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${CO}12`; (e.currentTarget as HTMLElement).style.borderColor = TERM.border; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = sessionId === c.id ? `${CO}12` : "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sessionId === c.id && <span style={{ color: CO, marginRight: 4 }}>●</span>}
                  {c.title}
                </div>
                <div style={{ fontSize: 9, color: "#484f58", marginTop: 2 }}>
                  {new Date(c.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {" · "}
                  {c.entries.filter((e) => e.role === "user").length} msgs
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteConvo(c.id, e)}
                style={{
                  background: "none", border: "none", color: "#484f58", cursor: "pointer",
                  fontSize: 13, padding: "2px 4px", borderRadius: 4, flexShrink: 0, lineHeight: 1,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f85149"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#484f58"; }}
                title="Delete conversation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* ── Terminal output ── */
        <div ref={terminalRef} style={s.terminal} onClick={(e) => {
          if ((e.ctrlKey || e.metaKey) && (e.target as HTMLElement).classList?.contains("slink")) {
            e.preventDefault();
            const src = (e.target as HTMLElement).getAttribute("data-src") || (e.target as HTMLElement).textContent || "";
            if (src) openSource(src);
          }
        }}>
          {history.length === 0 && blocks.length === 0 && (
            <div style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.8 }}>
              <span style={{ color: CO }}>✦</span> Describe your changes below.
              <br />
              <span style={{ fontSize: 10 }}>
                Use <span style={{ color: CO }}>⊕</span> to pick source files from the page.
                <br />
                <span style={{ color: CO }}>Ctrl+Click</span> a source tag to open in editor.
              </span>
            </div>
          )}

          {history.map((entry, i) => (
            <div key={i}>
              {entry.role === "user" ? (
                <div style={s.line}>
                  <span style={s.promptPrefix}>&gt; </span>
                  <span>{renderSourceLinks(entry.text || "", i * 1000)}</span>
                </div>
              ) : (
                <BlocksView
                  blocks={entry.blocks || []}
                  tokens={entry.tokens}
                  stats={entry.stats}
                />
              )}
            </div>
          ))}

          {blocks.length > 0 && streaming && (
            <BlocksView blocks={blocks} isStreaming tokens={tokens}
              onApprove={onApproveTool} onReject={onRejectTool} onApproveAll={onApproveAll} />
          )}
          {blocks.length > 0 && !streaming && history[history.length - 1]?.blocks !== blocks && (
            <BlocksView blocks={blocks} tokens={tokens} stats={stats}
              onApprove={onApproveTool} onReject={onRejectTool} onApproveAll={onApproveAll} />
          )}
        </div>
      )}

      {/* ── Input area ── */}
      <div style={s.inputRow} ref={dropZoneRef}>
        <span style={s.inputPrefix}>&gt;</span>
        <div
          ref={editableRef}
          className="claude-edit"
          contentEditable={!streaming && connected}
          suppressContentEditableWarning
          style={s.editable}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
        />
        {/* Pick toggle */}
        <button
          style={{
            ...s.btn, marginLeft: 6,
            background: picking ? CO : "none",
            border: picking ? `1px solid ${CO}` : `1px solid ${TERM.border}`,
            color: picking ? "#fff" : COLORS.muted,
          }}
          onClick={onTogglePick}
          title={picking ? "Stop picking (Esc)" : "Pick sources from page"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
        {/* Send / Abort */}
        {streaming ? (
          <button style={{ ...s.btn, marginLeft: 6, background: "transparent", color: "#f85149", border: "1px solid #f8514950" }}
            onClick={onAbort} title="Abort"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1" width="10" height="10" rx="1" /></svg>
          </button>
        ) : (
          <button
            style={{ ...s.btn, marginLeft: 6, background: canSend ? CO : TERM.border, color: canSend ? "#fff" : COLORS.muted }}
            disabled={!canSend} onClick={handleSend} title="Send (Ctrl+Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Status bar with live tokens ── */}
      <div style={s.statusBar}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#3fb950" : "#f85149", display: "inline-block" }} />
        <span>{connected ? (streaming ? "streaming" : picking ? "picking" : "connected") : "disconnected"}</span>
        {hasSession && <span style={{ color: CO_MED, marginLeft: 4 }}>• session</span>}
        {tokenText && <span style={{ color: "#484f58", marginLeft: 8 }}>{tokenText}</span>}
        <span style={{ marginLeft: "auto", color: TERM.border }}>enter · shift+enter ↵</span>
      </div>
    </div>
  );
};
