import { Router } from "express";
import type { AuthService } from "../../../services/auth.service";

export const createAuthRoutes = (auth: AuthService, getSessionUser: (req: any) => string | null) => {
  const router = Router();

  router.get("/ping", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/users", (_req, res) => {
    res.json(auth.getUsers());
  });

  router.post("/login", (req, res) => {
    try {
      const { user, password } = req.body || {};
      if (!user || !password) {
        return res.status(400).json({ ok: false, error: "Missing credentials" });
      }
      if (!auth.verifyCredentials(user, password)) {
        return res.status(401).json({ ok: false, error: "Invalid credentials" });
      }
      const token = auth.jwtSign({ user });
      res.setHeader(
        "Set-Cookie",
        `devtools_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${auth.expiry}`,
      );
      res.json({ ok: true, user });
    } catch {
      res.status(400).json({ ok: false, error: "Invalid request" });
    }
  });

  router.get("/session", (req, res) => {
    const user = getSessionUser(req);
    res.json(user ? { ok: true, user } : { ok: false });
  });

  router.get("/logout", (_req, res) => {
    res.setHeader("Set-Cookie", "devtools_session=; Path=/; HttpOnly; Max-Age=0");
    res.json({ ok: true });
  });

  return router;
};
