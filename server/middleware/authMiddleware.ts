import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: unknown, user: unknown) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    (req as Request & { user?: unknown }).user = user;
    next();
  });
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  authenticateToken(req, res, () => {
    const user = (req as Request & { user?: unknown }).user;
    const claims =
      user && typeof user === "object"
        ? (user as { id?: unknown; email?: unknown; role?: unknown; type?: unknown })
        : null;
    const hasAdminIdentity =
      claims !== null &&
      claims.type !== "member" &&
      Number.isSafeInteger(Number(claims.id)) &&
      typeof claims.email === "string" &&
      (!claims.role || claims.role === "admin");

    if (!hasAdminIdentity) {
      res.status(403).json({ error: "Administrator access required" });
      return;
    }
    next();
  });
}
