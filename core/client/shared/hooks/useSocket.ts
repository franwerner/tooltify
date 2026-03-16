import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SERVER_URL } from "../utils/serverUrl";

export function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${window.location.origin}${namespace}`, {
      path: `${SERVER_URL}/socket.io`,
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace]);

  return { socket: socketRef, connected };
}
