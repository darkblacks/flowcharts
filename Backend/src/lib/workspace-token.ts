import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type WorkspaceTokenPayload = {
  workspaceId: string;
  accessCodeId: string;
  userId: string;
  firebaseUid: string;
};

export function signWorkspaceToken(payload: WorkspaceTokenPayload) {
  return jwt.sign(payload, env.WORKSPACE_JWT_SECRET, {
    expiresIn: "2h",
  });
}