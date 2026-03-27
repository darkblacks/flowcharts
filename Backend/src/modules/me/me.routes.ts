import { Router } from "express";
import {
  requireAuth,
  type AuthenticatedRequest,
} from "../../middleware/requireAuth.js";
import { getProfileService } from "./me.service.js";

const meRoutes = Router();

meRoutes.get(
  "/profile",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const result = await getProfileService(req.user);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export { meRoutes };