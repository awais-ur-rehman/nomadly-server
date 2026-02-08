import { type Request, type Response } from "express";
import { MarketplaceService } from "../services/marketplace.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  searchBuilders = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      specialty: req.query.specialty
        ? (req.query.specialty as string).split(",")
        : undefined,
      maxRate: req.query.max_rate
        ? parseFloat(req.query.max_rate as string)
        : undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { builders, total } = await this.marketplaceService.searchBuilders(
      filters,
      { page, limit }
    );

    ApiResponse.paginated(res, builders, page, limit, total);
  });

  getBuilderReviews = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { reviews, total } = await this.marketplaceService.getBuilderReviews(
      id,
      { page, limit }
    );

    ApiResponse.paginated(res, reviews, page, limit, total);
  });

  requestConsultation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { builder_id, specialty } = req.body;
    const consultation = await this.marketplaceService.requestConsultation(
      req.user.userId,
      builder_id,
      specialty
    );
    ApiResponse.success(res, consultation, "Consultation requested", 201);
  });

  acceptConsultation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const consultation = await this.marketplaceService.acceptConsultation(
      id,
      req.user.userId
    );
    ApiResponse.success(res, consultation, "Consultation accepted");
  });

  createReview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { consultation_id, rating, comment } = req.body;
    const review = await this.marketplaceService.createReview(
      consultation_id,
      req.user.userId,
      rating,
      comment
    );
    ApiResponse.success(res, review, "Review created successfully", 201);
  });
}
