import { Server as SocketServer } from "socket.io";
import type { Server } from "http";
import type { AuthService } from "../../services/auth.service";

export function initSocket(httpServer: Server, auth: AuthService) {
  const io = new SocketServer(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie || "";
    const match = cookies.match(/devtools_session=([^;]+)/);
    const user = match ? auth.jwtVerify(match[1])?.user : null;
    if (!user) return next(new Error("Not authenticated"));
    socket.data.user = user;
    next();
  });

  return io;
}
