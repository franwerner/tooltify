import express from "express";
import { createAuthRoutes } from "./auth.routes";
import { createEditorRoutes } from "./editor.routes";
import { createBuildRoutes } from "./build.routes";
import { createSessionMiddleware } from "../../../middleware/session";
import { errorHandler } from "../../../middleware/error-handler";
import type { AuthService } from "../../../services/auth.service";
import type { EditorService } from "../../../services/editor.service";
import type { UserTrackerService } from "../../../services/user-tracker.service";
import type { BuildTrackerService } from "../../../services/build-tracker.service";

export interface RouterDeps {
  auth: AuthService;
  editor: EditorService;
  userTracker: UserTrackerService;
  buildTracker: BuildTrackerService;
}

export function createRouter(deps: RouterDeps) {
  const router = express.Router();

  router.use(express.json({ limit: "10mb" }));

  const { getSessionUser, sessionGuard } = createSessionMiddleware(deps.auth);

  router.use("/auth", createAuthRoutes(deps.auth, getSessionUser));

  router.use(sessionGuard);

  router.use("/editor", createEditorRoutes(deps.editor, deps.userTracker));
  router.use("/build", createBuildRoutes(deps.buildTracker));

  router.use(errorHandler);

  return router;
}
