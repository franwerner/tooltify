import { Router } from "express";
import { TooltifyError } from "#common/errors/tooltify.error";
import type { EditorService } from "../../../services/editor.service";
import type { UserTrackerService } from "../../../services/user-tracker.service";

export const createEditorRoutes = (editor: EditorService, userTracker: UserTrackerService) => {
  const router = Router();

  router.get("/read", (req, res) => {
    const relPath = req.query.path as string;
    if (!relPath) throw new TooltifyError("Missing path param", "MISSING_PARAM", 400);
    res.json({ message: "File read successfully", data: editor.read(relPath) });
  });

  router.post("/save", (req, res) => {
    const { path: relPath, content } = req.body || {};
    if (!relPath || typeof content !== "string") {
      throw new TooltifyError("Missing path or content", "MISSING_PARAM", 400);
    }
    const data = editor.save(relPath, content, req.sessionUser);
    userTracker.registerWebWrite(data.fullPath, data.user ?? "unknown");
    res.json({ message: "File saved successfully", data });
  });

  router.get("/open", (req, res) => {
    const source = req.query.source as string;
    if (!source) throw new TooltifyError("Missing source param", "MISSING_PARAM", 400);
    res.json({ message: "Editor opened", data: editor.openSource(source, req.sessionUser!) });
  });

  router.get("/meta", (_req, res) => {
    res.json({ message: "Editor meta", data: { root: editor.getRoot() } });
  });

  return router;
};
