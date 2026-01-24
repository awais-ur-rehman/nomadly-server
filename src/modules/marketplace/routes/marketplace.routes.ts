import { Router } from "express";
import { z } from "zod";
import { MarketplaceController } from "../controllers/marketplace.controller";
import { validate } from "../../../middleware/validation";
import { authenticate } from "../../../middleware/auth";

const router = Router();

const requestConsultationSchema = z.object({
  body: z.object({
    builder_id: z.string().min(1),
    specialty: z.string().min(1),
  }),
});

const createReviewSchema = z.object({
  body: z.object({
    consultation_id: z.string().min(1),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const createMarketplaceRoutes = (
  marketplaceController: MarketplaceController
) => {
  router.get("/builders", authenticate, marketplaceController.searchBuilders);
  router.post(
    "/consult",
    authenticate,
    validate(requestConsultationSchema),
    marketplaceController.requestConsultation
  );
  router.patch(
    "/consult/:id/accept",
    authenticate,
    marketplaceController.acceptConsultation
  );
  router.post(
    "/review",
    authenticate,
    validate(createReviewSchema),
    marketplaceController.createReview
  );

  return router;
};
