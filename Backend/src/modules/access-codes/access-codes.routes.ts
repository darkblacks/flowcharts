import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/requireAuth.js";
import { validateAccessCodeService } from "./access-codes.service.js";

const accessCodeRoutes = Router();

accessCodeRoutes.post(
  "/validate",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { code } = req.body as { code?: string };

      if (!code) {
        return res.status(400).json({
          message: "Código é obrigatório.",
        });
      }

      if (!req.user) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const result = await validateAccessCodeService({
        code,
        firebaseUid: req.user.firebaseUid,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export { accessCodeRoutes };
