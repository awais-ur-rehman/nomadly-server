import { Router } from "express";
import { VouchingController } from "../controllers/vouching.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

export const createVouchingRoutes = (vouchingController: VouchingController) => {
  router.post("/:userId", authenticate, vouchingController.createVouch);
  router.get("/received", authenticate, vouchingController.getReceivedVouches);

  return router;
};
