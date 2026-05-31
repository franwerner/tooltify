import http from "http";
import crypto from "crypto";
import os from "os";
import jwt from "jsonwebtoken";
import express from "express";
import cors from "cors";
import { createRouter } from "./presentation/http/routes";
import { initSocket } from "./presentation/ws";
import { loadConfig, loadGlobalConfig } from "#common/helpers/load-config.helper";
import { AuthService } from "./services/auth.service";
import { VaultService } from "./services/vault.service";
import { EditorService } from "./services/editor.service";
import { UserTrackerService } from "./services/user-tracker.service";
import { BuildTrackerService } from "./services/build-tracker.service";
import { AgentClient } from "./agent-client";
import { startDaemon } from "../cli/daemon/lifecycle";

interface ServerInstance {
  config: ReturnType<typeof loadConfig>;
  port: number;
  buildTracker: BuildTrackerService;
}

let cachedInstance: ServerInstance | null = null;
let httpServerRef: http.Server | null = null;
let userTrackerRef: UserTrackerService | null = null;
let agentClientRef: AgentClient | null = null;
let processCleanupAttached = false;

export function startServer(): ServerInstance {
  if (cachedInstance) return cachedInstance;

  const config = loadConfig();
  const globalConfig = loadGlobalConfig();
  const port = config.port;

  const vault = new VaultService(globalConfig.auth.secret);
  const auth = new AuthService(globalConfig.auth, vault);

  Object.entries(globalConfig.auth.users).forEach(([username, { hash }]) => {
    vault.set(username, hash);
  });

  const userTracker = new UserTrackerService(config.packagesDir);
  userTracker.start();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  const server = http.createServer(app);
  const { buildsNs } = initSocket(server, auth);

  const serverId = crypto.randomUUID();
  const agentToken = jwt.sign(
    { kind: "server", serverId, projectCwd: process.cwd() },
    globalConfig.auth.secret,
  );

  const agentClient = new AgentClient({
    port: globalConfig.agentPort,
    token: agentToken,
    spawnIfDown: () => startDaemon({ agentName: os.userInfo().username }),
  });
  agentClient.connect();
  agentClientRef = agentClient;

  const editor = new EditorService(config.packagesDir, agentClient, config.editorPathMap);

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
