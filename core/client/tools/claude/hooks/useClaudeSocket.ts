import { useRef, useState, useEffect, useCallback } from "react";

/* ── Block types for structured output ── */
export interface TextBlock { type: "text"; content: string }
export interface ToolBlock { type: "tool"; tool: string; file: string; id: string; done: boolean; pending?: boolean; input?: string; result?: string }
export type MessageBlock = TextBlock | ToolBlock;

export interface TokenUsage { input: number; output: number; cacheRead: number; cacheCreate: number }
export interface RunStats { cost: number; duration: number; turns: number }

export function useClaudeSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [blocks, setBlocks] = useState<MessageBlock[]>([]);
  const [tokens, setTokens] = useState<TokenUsage>({ input: 0, output: 0, cacheRead: 0, cacheCreate: 0 });
  const [stats, setStats] = useState<RunStats | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${location.host}/ws-claude`);
    wsRef.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case "connected":
            setConnected(true);
            break;

          case "text":
            setBlocks((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.type === "text") {
                return [...prev.slice(0, -1), { ...last, content: last.content + (msg.content || "") }];
              }
              return [...prev, { type: "text", content: msg.content || "" }];
            });
            break;

          case "usage":
            setTokens({
              input: msg.input || 0,
              output: msg.output || 0,
              cacheRead: msg.cache_read || 0,
              cacheCreate: msg.cache_create || 0,
            });
            break;

          case "tool_pending":
            setBlocks((prev) => [
              ...prev,
              { type: "tool", tool: msg.tool || "", file: msg.file || "", id: msg.id || "", done: false, pending: true, input: msg.input || "" },
            ]);
            break;

          case "tool_start":
            setBlocks((prev) => [
              ...prev,
              { type: "tool", tool: msg.tool || "", file: msg.file || "", id: msg.id || "", done: false },
            ]);
            break;

          case "tool_done":
            setBlocks((prev) =>
              prev.map((b) =>
                b.type === "tool" && b.id === msg.id
                  ? { ...b, done: true, pending: false, result: msg.content || "" }
                  : b
              )
            );
            break;

          case "tool_use":
            setBlocks((prev) => [
              ...prev,
              { type: "tool", tool: msg.tool || "", file: msg.content || "", id: "", done: true },
            ]);
            break;

          case "result":
            setStats({
              cost: msg.cost || 0,
              duration: msg.duration || 0,
              turns: msg.turns || 0,
            });
            if (msg.sessionId) setSessionId(msg.sessionId);
            if (msg.content) {
              setBlocks((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.type === "text") {
                  return [...prev.slice(0, -1), { ...last, content: last.content + msg.content }];
                }
                return [...prev, { type: "text", content: msg.content }];
              });
            }
            break;

          case "session":
            setSessionId(msg.sessionId || null);
            break;

          case "sessionReset":
            setSessionId(null);
            break;

          case "error":
          case "stderr":
            setBlocks((prev) => {
              const errText = `\n⚠️ ${msg.message || msg.content || "Error"}\n`;
              const last = prev[prev.length - 1];
              if (last && last.type === "text") {
                return [...prev.slice(0, -1), { ...last, content: last.content + errText }];
              }
              return [...prev, { type: "text", content: errText }];
            });
            break;

          case "done":
            setStreaming(false);
            break;

          case "aborted":
            setStreaming(false);
            setBlocks((prev) => [...prev, { type: "text", content: "\n— Aborted —" }]);
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      setStreaming(false);
    };
    ws.onerror = () => setConnected(false);

    return () => { ws.close(); };
  }, []);

  const send = useCallback((sources: string[], instruction: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    setBlocks([]);
    setTokens({ input: 0, output: 0, cacheRead: 0, cacheCreate: 0 });
    setStats(null);
    setStreaming(true);
    ws.send(JSON.stringify({ type: "prompt", sources, instruction }));
  }, []);

  const abort = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "abort" }));
  }, []);

  const newSession = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "newSession" }));
    setBlocks([]);
    setTokens({ input: 0, output: 0, cacheRead: 0, cacheCreate: 0 });
    setStats(null);
    setSessionId(null);
  }, []);

  const loadSession = useCallback((id: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "loadSession", sessionId: id }));
    setBlocks([]);
    setTokens({ input: 0, output: 0, cacheRead: 0, cacheCreate: 0 });
    setStats(null);
  }, []);

  const approveTool = useCallback((id: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "approve_tool", id }));
    setBlocks((prev) =>
      prev.map((b) =>
        b.type === "tool" && b.id === id ? { ...b, pending: false } : b
      )
    );
  }, []);

  const rejectTool = useCallback((id: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "reject_tool", id }));
  }, []);

  const approveAll = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "approve_all" }));
    setBlocks((prev) =>
      prev.map((b) =>
        b.type === "tool" && b.pending ? { ...b, pending: false } : b
      )
    );
  }, []);

  const hasSession = !!sessionId;

  return { connected, streaming, blocks, tokens, stats, hasSession, sessionId, send, abort, newSession, loadSession, approveTool, rejectTool, approveAll };
}
