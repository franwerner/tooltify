import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { CSSProperties } from "react";
import { COLORS, TERM, CO } from "../../../shared/colors";
import { apiFetch } from "../../../shared/serverUrl";
import { openSource } from "../../../shared/openSource";
import { useDragResize } from "../../../shared/useDragResize";
import { ResizeHandles } from "../../../shared/ResizeHandles";

/* ── Import resolution ── */

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
const INDEX_FILES = EXTENSIONS.map((ext) => `/index${ext}`);

type AliasMap = Record<string, string>;

function getAliases(): AliasMap {
  return (window as any).__ERXES_ALIASES__ || {};
}

/**
 * Resolve an import specifier to a relative path within PACKAGES.
 * Returns the resolved path or null if it can't be resolved client-side.
 */
function resolveImport(specifier: string, fromFile: string): string | null {
  const fromDir = fromFile.replace(/\/[^/]+$/, "");

  // Relative import: ./foo or ../foo
  if (specifier.startsWith(".")) {
    const parts = (fromDir + "/" + specifier).split("/");
    const resolved: string[] = [];
    for (const p of parts) {
      if (p === "." || p === "") continue;
      if (p === "..") { resolved.pop(); continue; }
      resolved.push(p);
    }
    return resolved.join("/");
  }

  // Alias import: try exact match first (with $), then prefix
  const aliases = getAliases();
  // Sort by length descending so longer (more specific) aliases match first
  const sorted = Object.keys(aliases).sort((a, b) => b.length - a.length);

  for (const alias of sorted) {
    const isExact = alias.endsWith("$");
    const key = isExact ? alias.slice(0, -1) : alias;

    if (isExact && specifier === key) {
      return aliases[alias];
    }
    if (!isExact && (specifier === key || specifier.startsWith(key + "/"))) {
      const rest = specifier.slice(key.length);
      return aliases[alias] + rest;
    }
  }

  return null;
}

/**
 * Try fetching a resolved path with different extensions.
 * Returns the path that exists, or null.
 */
async function resolveWithExtensions(basePath: string): Promise<string | null> {
  // If it already has an extension, try directly
  if (/\.\w+$/.test(basePath)) {
    const res = await apiFetch(`/editor/read?path=${encodeURIComponent(basePath)}`);
    const data = await res.json();
    return data.ok ? basePath : null;
  }

  // Try with extensions
  for (const ext of EXTENSIONS) {
    const res = await apiFetch(`/editor/read?path=${encodeURIComponent(basePath + ext)}`);
    const data = await res.json();
    if (data.ok) return basePath + ext;
  }

  // Try as directory with index file
  for (const idx of INDEX_FILES) {
    const res = await apiFetch(`/editor/read?path=${encodeURIComponent(basePath + idx)}`);
    const data = await res.json();
    if (data.ok) return basePath + idx;
  }

  return null;
}

/**
 * Extract import specifier from a line of code.
 * Matches: import ... from "specifier"  or  require("specifier")
 */
function extractImportSpecifier(line: string): string | null {
  const m = line.match(/from\s+['"]([^'"]+)['"]/) || line.match(/require\(\s*['"]([^'"]+)['"]\s*\)/);
  return m ? m[1] : null;
}

/* ── Styles ── */

interface Props {
  source: string;
  onClose: () => void;
}

const s: Record<string, CSSProperties> = {
  card: {
    background: TERM.bg, border: `1px solid ${TERM.border}`, borderRadius: 10,
    display: "flex", flexDirection: "column",
    overflow: "hidden", boxShadow: `0 0 0 1px ${CO}30, 0 16px 64px rgba(0,0,0,0.6)`,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    zIndex: 10000000,
  },
  titleBar: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
    background: TERM.surface, borderBottom: `1px solid ${TERM.border}`, userSelect: "none",
    cursor: "grab",
  },
  titleDots: { display: "flex", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
  titlePath: {
    flex: 1, fontSize: 11, color: COLORS.muted, overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  titleBtnGroup: { display: "flex", gap: 4 },
  titleBtn: {
    background: "none", border: "none", color: COLORS.muted, cursor: "pointer",
    fontSize: 15, padding: 0, lineHeight: 1, width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4,
  },
  editorWrap: { flex: 1, overflow: "hidden" },
  statusBar: {
    display: "flex", alignItems: "center", gap: 8, padding: "4px 14px 5px",
    borderTop: `1px solid ${TERM.border}`, background: TERM.surface, fontSize: 10, color: COLORS.muted,
  },
  saveBtn: {
    background: CO, color: "#fff", border: "none", borderRadius: 4,
    padding: "2px 12px", fontSize: 10, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", lineHeight: "18px",
  },
  saveBtnDisabled: {
    background: TERM.border, color: COLORS.muted, border: "none", borderRadius: 4,
    padding: "2px 12px", fontSize: 10, fontWeight: 600, cursor: "not-allowed",
    fontFamily: "inherit", lineHeight: "18px",
  },
  tabBar: {
    display: "flex", alignItems: "stretch", fontSize: 11, color: COLORS.muted,
    background: "#010409", borderBottom: `1px solid ${TERM.border}`,
    overflow: "auto", whiteSpace: "nowrap", flexShrink: 0,
  },
  tab: {
    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
    cursor: "pointer", borderRight: `1px solid ${TERM.border}`,
    background: "transparent", color: COLORS.muted, position: "relative" as const,
    transition: "background 0.15s, color 0.15s", userSelect: "none" as const,
  },
  tabActive: {
    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
    cursor: "default", borderRight: `1px solid ${TERM.border}`,
    background: TERM.bg, color: "#e6edf3", position: "relative" as const,
    borderTop: `2px solid ${CO}`, userSelect: "none" as const,
  },
  tabClose: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 16, height: 16, borderRadius: 3, border: "none",
    background: "transparent", color: COLORS.muted, cursor: "pointer",
    fontSize: 12, lineHeight: 1, padding: 0, marginLeft: 2,
  },
};

/* ── Component ── */

interface FileState {
  path: string;
  line: number;
  content: string;
  original: string;
  lang: string;
}

export const MiniEditor: React.FC<Props> = ({ source, onClose }) => {
  const { containerStyle, dragHandlers, resizeHandlers } = useDragResize({
    storageKey: "mini-editor-cfg",
    defaultW: 820,
    defaultH: Math.round(window.innerHeight * 0.75),
    minW: 400,
    minH: 300,
    defaultPosition: "center",
  });

  const [tabs, setTabs] = useState<FileState[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resolving, setResolving] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const current = tabs[activeIndex] || null;
  const currentPath = current?.path || "";
  const currentLine = current?.line || 1;
  const content = current?.content ?? null;
  const original = current?.original || "";
  const lang = current?.lang || "plaintext";

  // Parse source
  const parseSource = useCallback((src: string) => {
    const m = src.match(/^(.+?)(?::(\d+))?$/);
    return { path: m ? m[1] : src, line: m?.[2] ? parseInt(m[2], 10) : 1 };
  }, []);

  // Update current tab's content in-place
  const updateCurrent = useCallback((updates: Partial<FileState>) => {
    setTabs((prev) => prev.map((t, i) => i === activeIndex ? { ...t, ...updates } : t));
  }, [activeIndex]);

  // Switch to a tab (save editor position first)
  const switchTab = useCallback((index: number) => {
    const editor = editorRef.current;
    if (editor) {
      const pos = editor.getPosition();
      if (pos) {
        setTabs((prev) => prev.map((t, i) => i === activeIndex ? { ...t, line: pos.lineNumber } : t));
      }
    }
    setActiveIndex(index);
    setSaved(false);
    setError(null);
  }, [activeIndex]);

  // Close a tab (if last one, close the editor)
  const closeTab = useCallback((index: number) => {
    setTabs((prev) => {
      if (prev.length <= 1) {
        onClose();
        return prev;
      }
      const next = prev.filter((_, i) => i !== index);
      if (index < activeIndex) {
        setActiveIndex(activeIndex - 1);
      } else if (index === activeIndex) {
        setActiveIndex(Math.min(activeIndex, next.length - 1));
      }
      return next;
    });
    setSaved(false);
    setError(null);
  }, [activeIndex, onClose]);

  // Open a file in a new tab (or switch if already open)
  const openFile = useCallback((filePath: string, line: number) => {
    // Save current editor position
    const editor = editorRef.current;
    if (editor) {
      const pos = editor.getPosition();
      if (pos) {
        setTabs((prev) => prev.map((t, i) => i === activeIndex ? { ...t, line: pos.lineNumber } : t));
      }
    }

    // Check if already open
    const existingIdx = tabs.findIndex((t) => t.path === filePath);
    if (existingIdx >= 0) {
      setTabs((prev) => prev.map((t, i) => i === existingIdx ? { ...t, line } : t));
      setActiveIndex(existingIdx);
      setSaved(false);
      return;
    }

    // Add new tab after the active one
    const newTab: FileState = { path: filePath, line, content: "", original: "", lang: "plaintext" };
    setTabs((prev) => [...prev.slice(0, activeIndex + 1), newTab, ...prev.slice(activeIndex + 1)]);
    setActiveIndex(activeIndex + 1);
    setLoading(true);
    setError(null);
    setSaved(false);

    apiFetch(`/editor/read?path=${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setTabs((prev) => prev.map((t) => t.path === filePath && t.content === ""
            ? { ...t, content: res.content, original: res.content, lang: res.lang || "plaintext" }
            : t
          ));
        } else {
          setError(res.error || "Failed to load file");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tabs, activeIndex]);

  // Initial load
  useEffect(() => {
    const { path, line } = parseSource(source);
    setLoading(true);

    apiFetch(`/editor/read?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setTabs([{ path, line, content: res.content, original: res.content, lang: res.lang || "plaintext" }]);
          setActiveIndex(0);
        } else {
          setTabs([{ path, line, content: "", original: "", lang: "plaintext" }]);
          setError(res.error || "Failed to load file");
        }
      })
      .catch((e) => {
        setTabs([{ path, line, content: "", original: "", lang: "plaintext" }]);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to import
  const navigateToImport = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const pos = editor.getPosition();
    if (!pos) return;

    const model = editor.getModel();
    if (!model) return;

    const lineContent = model.getLineContent(pos.lineNumber);
    const specifier = extractImportSpecifier(lineContent);
    if (!specifier) return;

    const resolved = resolveImport(specifier, currentPath);
    if (!resolved) return;

    setResolving(true);
    try {
      const realPath = await resolveWithExtensions(resolved);
      if (realPath) {
        openFile(realPath, 1);
      }
    } finally {
      setResolving(false);
    }
  }, [currentPath, openFile]);

  const decorationsRef = useRef<any>(null);
  const saveRef = useRef<() => void>(() => {});

  // Editor mounted
  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Inject CSS for import link styling
    const styleId = "mini-editor-import-links";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .import-link-decoration {
          text-decoration: underline !important;
          color: #fff !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (currentLine > 1) {
      setTimeout(() => {
        editor.revealLineInCenter(currentLine);
        editor.setPosition({ lineNumber: currentLine, column: 1 });
        editor.focus();
      }, 50);
    } else {
      editor.focus();
    }

    // Ctrl+hover → underline import specifier under cursor
    const clearDecorations = () => {
      if (decorationsRef.current) {
        decorationsRef.current.clear();
        decorationsRef.current = null;
      }
    };

    editor.onMouseMove((e: any) => {
      if (!(e.event.ctrlKey || e.event.metaKey) || e.target?.type !== 6) {
        clearDecorations();
        return;
      }
      const pos = e.target.position;
      const model = editor.getModel();
      if (!pos || !model) { clearDecorations(); return; }

      const line = model.getLineContent(pos.lineNumber);
      const spec = extractImportSpecifier(line);
      if (!spec) { clearDecorations(); return; }

      const strMatch = line.match(/['"]([^'"]+)['"]/);
      if (!strMatch) { clearDecorations(); return; }

      const startCol = line.indexOf(strMatch[0]) + 2;
      const endCol = startCol + strMatch[1].length;
      if (pos.column < startCol || pos.column > endCol) { clearDecorations(); return; }

      clearDecorations();
      decorationsRef.current = editor.createDecorationsCollection([{
        range: new monaco.Range(pos.lineNumber, startCol, pos.lineNumber, endCol),
        options: { inlineClassName: "import-link-decoration" },
      }]);
    });

    editor.onMouseLeave(() => clearDecorations());

    // Also clear when Ctrl is released
    editor.onKeyUp((e: any) => {
      if (e.keyCode === monaco.KeyCode.Ctrl || e.keyCode === monaco.KeyCode.Meta) {
        clearDecorations();
      }
    });

    // Ctrl+S → save (use ref to always call latest version)
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => saveRef.current(),
    );

    // Ctrl+Click → navigate to import
    editor.onMouseDown((e: any) => {
      if (!(e.event.ctrlKey || e.event.metaKey)) return;
      if (e.target?.type !== 6 /* CONTENT_TEXT */) return;

      const pos = e.target.position;
      if (!pos) return;

      const model = editor.getModel();
      if (!model) return;

      const lineContent = model.getLineContent(pos.lineNumber);
      const specifier = extractImportSpecifier(lineContent);
      if (!specifier) return;

      const strMatch = lineContent.match(/['"]([^'"]+)['"]/);
      if (!strMatch) return;
      const strStart = lineContent.indexOf(strMatch[0]) + 1;
      const strEnd = strStart + strMatch[1].length;
      if (pos.column < strStart || pos.column > strEnd + 1) return;

      e.event.preventDefault();
      navigateToImport();
    });
  }, [currentLine, navigateToImport]);

  // Re-scroll when switching tabs
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && content !== null && !loading) {
      setTimeout(() => {
        editor.revealLineInCenter(currentLine);
        editor.setPosition({ lineNumber: currentLine, column: 1 });
        editor.focus();
      }, 50);
    }
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const modified = content !== null && content !== original;

  const handleSave = useCallback(() => {
    if (saving || content === null) return;
    setSaving(true);
    setSaved(false);
    apiFetch("/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: currentPath, content }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          updateCurrent({ original: content });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          alert("Save failed: " + (res.error || "Unknown error"));
        }
      })
      .catch((e) => alert("Save failed: " + e.message))
      .finally(() => setSaving(false));
  }, [content, currentPath, saving, updateCurrent]);

  // Keep ref in sync so Ctrl+S always calls the latest version
  saveRef.current = handleSave;

  // Esc → close tab or close editor
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (tabs.length > 1) {
          closeTab(activeIndex);
        } else if (modified) {
          if (confirm("You have unsaved changes. Close anyway?")) onClose();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, modified, tabs, activeIndex, closeTab]);

  const fileName = currentPath.split("/").pop() || currentPath;

  return (
      <div style={{ ...s.card, ...containerStyle }}>
        <ResizeHandles {...resizeHandlers} />
        {/* Title bar */}
        <div style={s.titleBar} {...dragHandlers}>
          <div style={s.titleDots}>
            <span style={{ ...s.dot, background: "#f85149" }} />
            <span style={{ ...s.dot, background: "#d29922" }} />
            <span style={{ ...s.dot, background: "#3fb950" }} />
          </div>
          <span
            style={{ ...s.titlePath, cursor: "default", textDecoration: "none" }}
            title={`${currentPath} — Ctrl+Click to open in IDE`}
            onPointerDown={(e) => {
              if (e.ctrlKey || e.metaKey) e.stopPropagation();
            }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                openSource(currentPath + (currentLine > 1 ? `:${currentLine}` : ""));
              }
            }}
            onMouseMove={(e) => {
              const ctrl = e.ctrlKey || e.metaKey;
              e.currentTarget.style.cursor = ctrl ? "pointer" : "default";
              e.currentTarget.style.color = ctrl ? "#fff" : COLORS.muted;
              e.currentTarget.style.textDecoration = ctrl ? "underline" : "none";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = "default";
              e.currentTarget.style.color = COLORS.muted;
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            <span>{fileName}</span>
            {currentPath !== fileName && (
              <span style={{ marginLeft: 6 }}>{currentPath}</span>
            )}
            {modified && <span style={{ color: "#d29922", marginLeft: 6 }}>●</span>}
          </span>
          <div style={s.titleBtnGroup}>
            <button
              style={s.titleBtn}
              onClick={() => { if (!modified || confirm("Unsaved changes. Close?")) onClose(); }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div style={s.tabBar}>
            {tabs.map((tab, i) => {
              const name = tab.path.split("/").pop() || tab.path;
              const ext = name.match(/\.(\w+)$/)?.[1] || "";
              const isActive = i === activeIndex;
              const isModified = tab.content !== tab.original;
              const iconColor = ext === "tsx" || ext === "ts" ? "#3178c6"
                : ext === "jsx" || ext === "js" ? "#f0db4f"
                : ext === "css" || ext === "scss" ? "#563d7c"
                : ext === "json" ? "#cb8622" : COLORS.muted;
              return (
                <div
                  key={tab.path}
                  style={isActive ? s.tabActive : s.tab}
                  onClick={isActive ? undefined : () => switchTab(i)}
                  onMouseDown={(e) => {
                    if (e.button !== 1) return;
                    e.preventDefault();
                    if (tabs.length > 1) closeTab(i);
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = TERM.surface;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                  title={tab.path}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: iconColor, flexShrink: 0 }} />
                  <span>{name}</span>
                  {isModified && <span style={{ color: "#d29922", fontSize: 14, lineHeight: "1" }}>●</span>}
                  {tabs.length > 1 && (
                    <button
                      style={s.tabClose}
                      onClick={(e) => { e.stopPropagation(); closeTab(i); }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = TERM.border; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Editor */}
        <div style={s.editorWrap}>
          {loading && (
            <div style={{ padding: 20, color: COLORS.muted, fontSize: 11 }}>Loading...</div>
          )}
          {error && (
            <div style={{ padding: 20, color: "#f85149", fontSize: 11 }}>{error}</div>
          )}
          {content !== null && !loading && (
            <Editor
              key={currentPath}
              height="100%"
              language={lang}
              theme="vs-dark"
              value={content}
              onChange={(val) => updateCurrent({ content: val ?? "" })}
              onMount={handleMount}
              beforeMount={(monaco) => {
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                });
              }}
              options={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                padding: { top: 8, bottom: 8 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          )}
        </div>

        {/* Status bar */}
        <div style={s.statusBar}>
          <span>{lang}</span>
          {resolving && <span style={{ color: CO }}>Resolving...</span>}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {saved && <span style={{ color: "#3fb950" }}>Saved</span>}
            {saving && <span style={{ color: CO }}>Saving...</span>}
            <span style={{ color: TERM.border }}>Ctrl+Click import</span>
            <span style={{ color: TERM.border }}>Ctrl+S</span>
            <button
              style={modified && !saving ? s.saveBtn : s.saveBtnDisabled}
              disabled={!modified || saving}
              onClick={handleSave}
            >
              Save
            </button>
          </span>
        </div>
      </div>
  );
};
