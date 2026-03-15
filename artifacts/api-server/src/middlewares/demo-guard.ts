import { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";

export function demoGuard(req: Request, res: Response, next: NextFunction) {
  const isDemoSession = req.headers["x-demo-session"] === "true";

  if (!isDemoSession) {
    return next();
  }

  (req as AuthRequest).isDemoSession = true;

  const method = req.method.toUpperCase();
  const path = req.originalUrl || req.path;

  const blockedPaths = [
    { methods: ["GET"], prefix: "/api/export" },
    { methods: ["POST", "PATCH", "PUT", "DELETE"], prefix: "/api/sms" },
    { methods: ["POST", "PATCH", "PUT", "DELETE"], prefix: "/api/payments" },
  ];

  for (const rule of blockedPaths) {
    if (rule.methods.includes(method) && path.startsWith(rule.prefix)) {
      const label = rule.prefix.replace("/api/", "");
      return res.status(403).json({
        error: "demo_restricted",
        message: `${label.charAt(0).toUpperCase() + label.slice(1)} operations are disabled in demo mode.`,
      });
    }
  }

  next();
}
