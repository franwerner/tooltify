import { Router } from "express";
import { TooltifyError } from "#common/errors/tooltify.error";
import type { AuthService } from "../../../services/auth.service";

export const createAuthRoutes = (
  auth: AuthService,
  getSessionUser: (req: any) => string | null,
  sessionGuard: (req: any, res: any, next: any) => void,
  cookieName: string,
) => {
  const router = Router();

  router.get("/ping", (_req, res) => {
    res.json({ message: "pong" });
  });

  router.get("/users", (_req, res) => {
    res.json({ message: "Users retrieved", data: auth.getUsers() });
  });

  router.post("/login", (req, res) => {
    const { user, password } = req.body || {};
    if (!user || !password) throw new TooltifyError("Missing credentials", "MISSING_CREDENTIALS", 400);
    const data = auth.login(user, password);
    res.setHeader(
      "Set-Cookie",
      `${cookieName}=${data.token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${auth.expiry}`
    );
    res.json({ message: "Login successful", data });
  });

  router.post("/register", (req, res, next) => {
    const isBootstrap = auth.getUsers().length === 0;
    if (isBootstrap) {
      return registerUser(req, res);
    }
    return sessionGuard(req, res, (err?: any) => {
      if (err) return next(err);
      return registerUser(req, res);
    });
  });

  router.get("/session", (req, res) => {
    const user = getSessionUser(req);
    if (!user) throw new TooltifyError("No active session", "NO_SESSION", 401);
    res.json({ message: "Session active", data: { user } });
  });

  router.get("/logout", (_req, res) => {
    res.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; Max-Age=0`);
    res.json({ message: "Logged out" });
  });

  function registerUser(req: any, res: any): void {
    const { user, password } = req.body || {};
    if (!user || !password) throw new TooltifyError("Missing credentials", "MISSING_CREDENTIALS", 400);
    auth.register(user, password);
    res.status(201).json({ message: "User registered" });
  }

  return router;
};
