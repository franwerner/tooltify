import http from "http";
import express from "express";
import cors from "cors";
import { createRouter } from "./presentation/http/routes";
import { initSocket } from "./presentation/ws";
import { loadConfig } from "#common/helpers/load-config.helper";
import { AuthService } from "./services/auth.service";
import { VaultService } from "./services/vault.service";
import { EditorService } from "./services/editor.service";
import { UserTrackerService } from "./services/user-tracker.service";
import { BuildTrackerService } from "./services/build-tracker.service";

interface ServerInstance {
  config: ReturnType<typeof loadConfig>;
  port: number;
  buildTracker: BuildTrackerService;
  agentWs: ReturnType<typeof initSocket>["agentWs"];
}

let cachedInstance: ServerInstance | null = null;
let httpServerRef: http.Server | null = null;
let userTrackerRef: UserTrackerService | null = null;
let processCleanupAttached = false;

export function startServer(): ServerInstance {
  if (cachedInstance) return cachedInstance;

  const config = loadConfig();
  const port = config.port;

  const vault = new VaultService(config.auth.secret);
  const auth = new AuthService(config.auth, vault);
  const userTracker = new UserTrackerService(config.packagesDir);
  userTracker.start();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  const server = http.createServer(app);
  const { agentWs, buildsNs } = initSocket(server, auth, vault, config.auth.secret);
  const editor = new EditorService(config.packagesDir, agentWs);

  const buildTracker = new BuildTrackerService(buildsNs, userTracker);

  app.use(createRouter({ auth, editor, userTracker, buildTracker }));

  server.listen(port, () => {
    console.log(`[tooltify] server running on http://localhost:${port}`);
    console.log(config);
  });

  httpServerRef = server;
  userTrackerRef = userTracker;

  cachedInstance = {
    config,
    port,
    buildTracker,
    agentWs,
  };

  if (!processCleanupAttached) {
    attachProcessCleanup();
    processCleanupAttached = true;
  }

  return cachedInstance;
}

function attachProcessCleanup() {
  const cleanup = () => {
    try { userTrackerRef?.shutdown(); } catch { }
    try { httpServerRef?.close(); } catch { }
    cachedInstance = null;
    httpServerRef = null;
    userTrackerRef = null;
  };

  process.once("beforeExit", cleanup);
  process.once("SIGINT", () => { cleanup(); process.exit(130); });
  process.once("SIGTERM", () => { cleanup(); process.exit(143); });
}
