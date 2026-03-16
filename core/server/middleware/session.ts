import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "../services/auth.service";
import { TooltifyError } from "#common/errors/tooltify.error";

declare global {
  namespace Express {
    interface Request {
      sessionUser?: string;
    }
  }
}

export const createSessionMiddleware = (auth: AuthService) => {
  const getSessionUser = (req: Request): string | null => {
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/tooltify_session=([^;]+)/);
    if (!match) return null;
    const payload = auth.jwtVerify(match[1]);
    return payload?.user || null;
  };

  const sessionGuard = (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) {
      throw new TooltifyError("No active session", "NO_SESSION", 401);
    }
    req.sessionUser = sessionUser;
    next();
  };

  return { getSessionUser, sessionGuard };
};
