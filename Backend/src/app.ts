import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { accessCodeRoutes } from "./modules/access-codes/access-codes.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "FlowCharts backend online.",
    });
  });

  app.use("/health", healthRoutes);
  app.use("/access-codes", accessCodeRoutes);

  app.use(errorHandler);

  return app;
}
