import { useState, useEffect } from "react";

export function useKeyHeld(...keys: string[]): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const matches = (e: KeyboardEvent) => keys.includes(e.key);
    const down = (e: KeyboardEvent) => { if (matches(e)) setHeld(true); };
    const up = (e: KeyboardEvent) => { if (matches(e)) setHeld(false); };
    // Si el foco se va de la ventana con la tecla apretada, el keyup nunca llega
    // y quedaría trabado en "held": blur/visibilitychange lo resetean.
    const reset = () => setHeld(false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [keys.join(",")]);

  return held;
}
