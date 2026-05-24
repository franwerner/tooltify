import React, { createContext, useContext, useRef, useEffect, useCallback } from "react";
import { SHORTCUTS, type KeyChord } from "./shortcuts";

type CommandHandler = () => void;

interface KeymapState {
  register: (id: string, handler: CommandHandler) => () => void;
}

const KeymapContext = createContext<KeymapState>({ register: () => () => { } });

const matchesChord = (e: KeyboardEvent, c: KeyChord): boolean =>
  e.key === c.key &&
  (c.ctrl === undefined || e.ctrlKey === c.ctrl) &&
  (c.shift === undefined || e.shiftKey === c.shift) &&
  (c.alt === undefined || e.altKey === c.alt) &&
  (c.meta === undefined || e.metaKey === c.meta);

export const KeymapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlers = useRef<Map<string, CommandHandler>>(new Map());

  const register = useCallback((id: string, handler: CommandHandler) => {
    handlers.current.set(id, handler);
    return () => {
      // Solo borrar si sigue siendo el mismo handler: evita que un re-registro
      // ajeno se pierda por el cleanup de un unmount tardío.
      if (handlers.current.get(id) === handler) handlers.current.delete(id);
    };
  }, []);

  useEffect(() => {
    const keyShortcuts = SHORTCUTS.filter((s) => s.chord);
    const onKeyDown = (e: KeyboardEvent) => {
      for (const s of keyShortcuts) {
        if (matchesChord(e, s.chord!)) {
          const handler = handlers.current.get(s.id);
          if (handler) {
            e.preventDefault();
            handler();
          }
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <KeymapContext.Provider value={{ register }}>{children}</KeymapContext.Provider>;
};

export const useCommand = (id: string, handler: CommandHandler) => {
  const { register } = useContext(KeymapContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => register(id, () => handlerRef.current()), [id, register]);
};
