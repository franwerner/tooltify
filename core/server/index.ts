import http from "http";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import { createRouter } from "./presentation/http/routes";
import { initSocket } from "./presentation/ws";
import {
  loadConfig,
  loadProjectAuthStore,
  writeProjectAuthStore,
} from "#common/helpers/load-config.helper";
import { AuthService } from "./services/auth.service";
import { VaultService } from "./services/vault.service";
import { EditorService } from "./services/editor.service";
import { UserTrackerService } from "./services/user-tracker.service";
import { BuildTrackerService } from "./services/build-tracker.service";

interface ServerInstance {
  config: ReturnType<typeof loadConfig>;
  port: number;
  buildTracker: BuildTrackerService;
}

let cachedInstance: ServerInstance | null = null;
let httpServerRef: http.Server | null = null;
let userTrackerRef: UserTrackerService | null = null;
let processCleanupAttached = false;

export function startServer(): ServerInstance {
  if (cachedInstance) return cachedInstance;

  const config = loadConfig();
  const port = config.port;
  // Las cookies se aíslan por dominio, no por puerto: con varios proyectos en
  // localhost una sesión pisaría la otra. El nombre por-puerto las separa.
  const cookieName = `tooltify_session_${port}`;

  const projectCwd = process.cwd();
  let authStore = loadProjectAuthStore(projectCwd);
  if (!authStore) {
    authStore = {
      salt: crypto.randomBytes(16).toString("hex"),
      secret: crypto.randomBytes(32).toString("hex"),
      users: {},
    };
    writeProjectAuthStore(projectCwd, authStore);
  }

  const { salt, secret, users } = authStore;

  const vault = new VaultService(secret, (updatedUsers) => {
    const current = loadProjectAuthStore(projectCwd) ?? { salt, secret, users: {} };
    const serializedUsers: Record<string, { hash: string }> = {};
    updatedUsers.forEach((v, k) => { serializedUsers[k] = v; });
    writeProjectAuthStore(projectCwd, { ...current, users: serializedUsers });
  });

  Object.entries(users).forEach(([username, { hash }]) => {
    vault.set(username, hash);
  });

  const auth = new AuthService({ salt, secret }, vault);

  const userTracker = new UserTrackerService(config.packagesDir);
  userTracker.start();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  const server = http.createServer(app);
  const { buildsNs, agentHub } = initSocket(server, auth, cookieName);

  const editor = new EditorService(config.packagesDir, agentHub, config.editorPathMap);

  const buildTracker = new BuildTrackerService(buildsNs, userTracker);

  app.use(createRouter({ auth, editor, userTracker, buildTracker, cookieName }));

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
