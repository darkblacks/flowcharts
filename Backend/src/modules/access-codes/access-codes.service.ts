import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

type ValidateAccessCodeInput = {
  code: string;
  firebaseUid: string;
};

type ValidateAccessCodeOutput = {
  workspaceToken: string;
  workspace: {
    id: string;
    name: string;
  };
};

export async function validateAccessCodeService(
  input: ValidateAccessCodeInput
): Promise<ValidateAccessCodeOutput> {
  const normalizedCode = input.code.trim();

  if (!normalizedCode) {
    throw new Error("Código de acesso vazio.");
  }

  /**
   * Versão inicial:
   * usa um código fallback via env.
   * Depois trocamos isso por consulta real ao banco.
   */
  if (normalizedCode !== env.ACCESS_CODE_FALLBACK) {
    throw new Error("Código inválido.");
  }

  const workspace = {
    id: "workspace-demo",
    name: "Workspace Inicial",
  };

  const workspaceToken = jwt.sign(
    {
      workspaceId: workspace.id,
      firebaseUid: input.firebaseUid,
    },
    env.WORKSPACE_JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  return {
    workspaceToken,
    workspace,
  };
}
