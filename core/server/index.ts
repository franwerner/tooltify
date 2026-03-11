import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { createRouter } from "./presentation/http/routes";
import { initSocket } from "./presentation/ws";
import { loadConfig } from "./helpers/load-config.helper";
import { AuthService } from "./services/auth.service";
import { EditorService } from "./services/editor.service";
import { TrackerService } from "./services/tracker.service";
import { UserTrackerService } from "./services/user-tracker.service";
import { BuildTrackerService } from "./services/build-tracker.service";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_BUNDLE = path.resolve(__dirname, "../client/dist/client.iife.js");


export interface StartOptions {
  port?: number;
  configDir?: string;
}

export function startServer(opts: StartOptions = {}) {
  const config = loadConfig(opts);
  const port = config.port

  const auth = new AuthService(config.auth);
  const editor = new EditorService(config.packagesDir);
  const tracker = new TrackerService(editor);
  const userTracker = new UserTrackerService(config.packagesDir);
  userTracker.start();


  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.get("/tooltify.js", (_req, res) => res.sendFile(CLIENT_BUNDLE));

  const server = http.createServer(app);
  const io = initSocket(server, auth);

  const buildTracker = new BuildTrackerService(io.of("/builds"), userTracker);

  app.use(createRouter({ auth, editor, tracker, userTracker, buildTracker }));

  server.listen(port, () => {
    console.log(`[tooltify] server running on http://localhost:${port}`);
    console.log(config)
  });

  return {
    config,
    port,
    buildTracker,
    cleanDeps() {
      userTracker.shutdown();
    },
  };
}
