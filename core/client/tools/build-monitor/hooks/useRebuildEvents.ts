import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../../../shared/useSocket";
import { storage } from "../storage";
import { hasActiveCompileError } from "../components/CompileErrorOverlay";
import type { RebuildEvent, EventStatus } from "../types";

const MAX_EVENTS = 100;

export function useRebuildEvents() {
  const { socket, connected } = useSocket("/builds");
  const [events, setEvents] = useState<RebuildEvent[]>([]);
  const [building, setBuilding] = useState(false);

  const pushEvent = useCallback(
    (user: string, file: string, status: EventStatus, error?: string) => {
      const evt: RebuildEvent = {
        user, file, timestamp: Date.now(),
        applied: status !== "error", status, error,
      };
      setEvents((prev) => [evt, ...prev].slice(0, MAX_EVENTS));
    },
    []
  );

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    s.on("rebuild", (data: { user: string; file: string }) => {
      setBuilding(true);
      pushEvent(data.user, data.file, "building");
    });

    s.on("done", (data: { ok: boolean; hash?: string; user: string; file: string; errors?: string[] }) => {
      setBuilding(false);

      if (!data.ok && data.errors?.length) {
        pushEvent(data.user, data.file, "error", data.errors.join("\n"));
        return;
      }

      const currentUser = storage.getUser();
      const subs = storage.getSubscribed();
      const wasApplied =
        !currentUser ||
        data.user === currentUser ||
        data.user === "unknown" ||
        subs.includes(data.user);

      setEvents((prev) => [
        {
          user: data.user,
          file: data.file,
          timestamp: Date.now(),
          applied: wasApplied,
          status: "done" as const,
        },
        ...prev,
      ].slice(0, MAX_EVENTS));
    });

    s.on("status", (data: { ok: boolean; user: string; file: string }) => {
      if (!data.ok) {
        setBuilding(false);
        pushEvent(data.user, data.file, "error");
      }
    });

    return () => {
      s.off("rebuild");
      s.off("done");
      s.off("status");
    };
  }, [socket, pushEvent]);

  const applyEvent = (idx: number) => {
    setEvents((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, applied: true } : e))
    );
  };

  return { events, connected, building, applyEvent };
}
