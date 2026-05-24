import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useCommand } from "../keybindings/Keymap";

export type ToolId = "monitor" | "editor" | null;

interface ActiveToolState {
  activeTool: ToolId;
  open: (tool: ToolId) => void;
  close: (tool: ToolId) => void;
  toggle: (tool: ToolId) => void;
  isOpen: (tool: ToolId) => boolean;
}

const ActiveToolContext = createContext<ActiveToolState>({
  activeTool: null,
  open: () => { },
  close: () => { },
  toggle: () => { },
  isOpen: () => false,
});

export const useActiveTool = () => useContext(ActiveToolContext);

export const ActiveToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const open = useCallback((tool: ToolId) => {
    setActiveTool(tool);
  }, []);

  const close = useCallback((tool: ToolId) => {
    setActiveTool((prev) => (prev === tool ? null : prev));
  }, []);

  const toggle = useCallback((tool: ToolId) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  }, []);

  const isOpen = useCallback((tool: ToolId) => activeTool === tool, [activeTool]);

  useCommand("monitor.toggle", () => toggle("monitor"));
  useCommand("editor.toggle", () => toggle("editor"));

  // Escape cierra el tool activo. Queda local (no en el dispatcher) porque su
  // efecto depende del contexto: solo actúa si hay un tool abierto.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTool !== null) setActiveTool(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTool]);

  return (
    <ActiveToolContext.Provider value={{ activeTool, open, close, toggle, isOpen }}>
      {children}
    </ActiveToolContext.Provider>
  );
};
