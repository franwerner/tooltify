import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SERVER_URL } from "../utils/serverUrl";

export function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const isAbsolute = /^https?:\/\/|^\/\//.test(SERVER_URL);
    const url = isAbsolute ? SERVER_URL : window.location.origin;
    const path = isAbsolute ? "/socket.io" : `${SERVER_URL}/socket.io`;

    const socket = io(`${url}${namespace}`, {
      path,
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
