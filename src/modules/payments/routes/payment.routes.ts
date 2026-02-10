import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../../../middleware/auth";

const router = Router();

export const createPaymentRoutes = (paymentController: PaymentController) => {
  router.post("/webhook", paymentController.webhook);
  router.get("/status", authenticate, paymentController.getStatus);
  router.post("/sync", authenticate, paymentController.sync);

  return router;
};
