import type { Request, Response, NextFunction } from "express";
import { TooltifyError } from "#common/errors/tooltify.error";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof TooltifyError || (err as any)?.name === "TooltifyError") {
        const e = err as TooltifyError;
        return res.status(e.statusCode).json({ ok: false, message: e.message, code: e.code });
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ ok: false, message, code: "INTERNAL_ERROR" });
}
