import type { NextFunction, Request, Response } from "express";
import { firebaseAdmin, firebaseReady } from "../lib/firebase-admin.js";

export type AuthenticatedRequest = Request & {
  user?: {
    firebaseUid: string;
    email: string | null;
    name?: string | null;
  };
};

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!firebaseReady) {
      return res.status(500).json({
        message: "Firebase Admin não configurado no backend.",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token de autenticação ausente.",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    req.user = {
      firebaseUid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}
