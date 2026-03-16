import http from "http";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_BUNDLE = path.resolve(__dirname, "../client/dist/client.iife.js");


export function startServer() {
  const config = loadConfig();
  const port = config.port

  const vault = new VaultService(config.auth.secret);
  const auth = new AuthService(config.auth, vault);
  const userTracker = new UserTrackerService(config.packagesDir);
  userTracker.start();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.get("/tooltify.js", (_req, res) => res.sendFile(CLIENT_BUNDLE));

  const server = http.createServer(app);
  const { agentWs, buildsNs } = initSocket(server, auth, vault);
  const editor = new EditorService(config.packagesDir, agentWs);

  const buildTracker = new BuildTrackerService(buildsNs, userTracker);

  app.use(createRouter({ auth, editor, userTracker, buildTracker }));

  server.listen(port, () => {
    console.log(`[tooltify] server running on http://localhost:${port}`);
    console.log(config)
  });

  return {
    config,
    port,
    buildTracker,
    agentWs,
    cleanDeps() {
      userTracker.shutdown();
    },
  };
}
