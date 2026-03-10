import { Router } from "express";
import type { BuildTrackerService } from "../../../services/build-tracker.service";

export const createBuildRoutes = (buildTracker: BuildTrackerService) => {
  const router = Router();

  router.get("/user", (req, res) => {
    const h = req.query.h as string;
    res.json(buildTracker.getRebuildInfo(h));
  });

  router.get("/status", (_req, res) => {
    res.json(buildTracker.getStatus());
  });

  return router;
};
