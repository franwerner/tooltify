import { useState, useEffect } from "react";

export function useKeyboardToggle(key: string, ctrl = true, shift = true) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((!ctrl || e.ctrlKey) && (!shift || e.shiftKey) && e.key === key) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, ctrl, shift]);

  return [open, setOpen] as const;
}
