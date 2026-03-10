import { Router } from "express";
import type { EditorService } from "../../../services/editor.service";
import type { TrackerService } from "../../../services/tracker.service";
import type { UserTrackerService } from "../../../services/user-tracker.service";

export const createEditorRoutes = (editor: EditorService, tracker: TrackerService, userTracker: UserTrackerService) => {
  const router = Router();

  router.get("/read", (req, res) => {
    const relPath = req.query.path as string;
    if (!relPath) return res.status(400).json({ ok: false, error: "Missing path param" });

    const result = editor.read(relPath);
    res.status(result.ok ? 200 : 404).json(result);
  });

  router.post("/save", (req, res) => {
    const { path: relPath, content } = req.body || {};
    if (!relPath || typeof content !== "string") {
      return res.status(400).json({ ok: false, error: "Missing path or content" });
    }

    const result = editor.save(relPath, content, req.sessionUser);
    if (result.ok && result.fullPath && result.user) {
      userTracker.registerWebWrite(result.fullPath, result.user);
    }
    res.status(result.ok ? 200 : 500).json(result);
  });

  router.get("/open", (req, res) => {
    const source = req.query.source as string;
    if (!source) return res.status(400).json({ ok: false, error: "Missing source param" });
    res.json(tracker.openSource(source, req.sessionUser!));
  });

  return router;
};
