import { type Request, type Response } from "express";
import { MarketplaceService } from "../services/marketplace.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) { }

  searchBuilders = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      // Client sends comma-separated 'specialties' (plural) but backend logic might expect singular or array
      specialty: req.query.specialties
        ? (req.query.specialties as string).split(",")
        : req.query.specialty // Fallback for singular
          ? (req.query.specialty as string).split(",")
          : undefined,
      maxRate: req.query.max_rate
        ? parseFloat(req.query.max_rate as string)
        : undefined,
      search: (req.query.search || req.query.q) as string | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { builders, total } = await this.marketplaceService.searchBuilders(
      filters,
      { page, limit }
    );

    // Transform raw User docs into BuilderProfile shape the client expects
    const transformedBuilders = builders.map((builder: any) => {
      const doc = builder.toObject ? builder.toObject() : builder;
      return {
        id: doc._id?.toString() || doc.id,
        user: {
          id: doc._id?.toString() || doc.id,
          username: doc.username || '',
          name: doc.profile?.name || '',
          photoUrl: doc.profile?.photo_url || '',
        },
        businessName: doc.builder_profile?.business_name || '',
        description: doc.builder_profile?.bio || '',
        specialty: doc.builder_profile?.specialty_tags || [],
        rating: doc.builder_profile?.hourly_rate || 0.0,
        reviewCount: 0,
        portfolioImageUrls: doc.builder_profile?.portfolio_images || [],
        isVerified: doc.nomad_id?.verified || false,
        locationBase: doc.profile?.bio || null,
      };
    });

    ApiResponse.paginated(res, transformedBuilders, page, limit, total);
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

  getMyConsultations = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const consultations = await this.marketplaceService.getMyConsultations(
      req.user.userId
    );
    ApiResponse.success(res, consultations);
  });
}
