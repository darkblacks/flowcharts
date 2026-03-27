import type { NextFunction, Request, Response } from "express";
import { verifyFirebaseIdToken } from "../lib/verify-firebase-id-token.js";

export type AuthenticatedRequest = Request & {
  user?: {
    firebaseUid: string;
    email: string | null;
    name: string | null;
  };
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token de autenticação ausente.",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = await verifyFirebaseIdToken(token);

    req.user = {
      firebaseUid: decoded.sub,
      email: typeof decoded.email === "string" ? decoded.email : null,
      name: typeof decoded.name === "string" ? decoded.name : null,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}