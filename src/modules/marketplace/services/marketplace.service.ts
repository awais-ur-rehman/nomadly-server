import { User } from "../../users/models/user.model";
import { Consultation } from "../models/consultation.model";
import { Review } from "../models/review.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";
import { NotificationService } from "../../notifications/services/notification.service";

export class MarketplaceService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async searchBuilders(filters: any, pagination: { page: number; limit: number }): Promise<{ builders: any[]; total: number }> {
    const query: any = {
      is_builder: true,
      is_active: true,
      // Include builders who are available OR haven't set their status yet (defaults to available)
      $or: [
        { "builder_profile.availability_status": "available" },
        { "builder_profile.availability_status": { $exists: false } },
        { "builder_profile.availability_status": null },
      ],
    };

    if (filters.specialty) {
      query["builder_profile.specialty_tags"] = { $in: filters.specialty };
    }

    if (filters.maxRate) {
      query["builder_profile.hourly_rate"] = { $lte: filters.maxRate };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const builders = await User.find(query)
      .select("-password_hash")
      .skip(skip)
      .limit(pagination.limit)
      .sort({ "builder_profile.hourly_rate": 1 });

    const total = await User.countDocuments(query);

    return { builders, total };
  }

  async requestConsultation(
    requesterId: string,
    builderId: string,
    specialty: string
  ): Promise<any> {
    const builder = await User.findById(builderId);
    if (!builder || !builder.is_builder) {
      throw new NotFoundError("Builder not found");
    }

    // Get requester info for notification
    const requester = await User.findById(requesterId).select("username profile.name");

    const consultation = await Consultation.create({
      requester_id: requesterId,
      builder_id: builderId,
      specialty,
      status: "pending",
      payment_status: "unpaid",
    });

    // Send notification to builder
    const requesterName = requester?.profile?.name || requester?.username || "Someone";
    await this.notificationService.sendConsultationRequestNotification(
      builderId,
      requesterName,
      specialty,
      consultation._id.toString(),
      requesterId
    );

    return consultation;
  }

  async acceptConsultation(consultationId: string, builderId: string): Promise<any> {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      throw new NotFoundError("Consultation not found");
    }

    if (consultation.builder_id.toString() !== builderId) {
      throw new ValidationError("Only the builder can accept this consultation");
    }

    consultation.status = "accepted";
    await consultation.save();

    // Get builder info for notification
    const builder = await User.findById(builderId).select("username profile.name builder_profile.business_name");
    const builderName = builder?.builder_profile?.business_name || builder?.profile?.name || builder?.username || "A builder";

    // Send notification to requester
    await this.notificationService.sendConsultationAcceptedNotification(
      consultation.requester_id.toString(),
      builderName,
      consultationId,
      builderId
    );

    return consultation;
  }

  async getBuilderReviews(builderId: string, pagination: { page: number; limit: number }): Promise<{ reviews: any[]; total: number }> {
    const skip = (pagination.page - 1) * pagination.limit;

    const reviews = await Review.find({ builder_id: builderId })
      .populate("reviewer_id", "profile.name profile.photo_url username")
      .skip(skip)
      .limit(pagination.limit)
      .sort({ created_at: -1 });

    const total = await Review.countDocuments({ builder_id: builderId });

    return { reviews, total };
  }

  async getMyConsultations(userId: string): Promise<any[]> {
    const consultations = await Consultation.find({
      $or: [
        { requester_id: userId },
        { builder_id: userId },
      ],
    })
      .populate("requester_id", "username profile.name profile.photo_url")
      .populate("builder_id", "username profile.name profile.photo_url builder_profile")
      .sort({ created_at: -1 });

    return consultations;
  }

  async createReview(
    consultationId: string,
    reviewerId: string,
    rating: number,
    comment?: string
  ): Promise<any> {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      throw new NotFoundError("Consultation not found");
    }

    if (consultation.requester_id.toString() !== reviewerId) {
      throw new ValidationError("Only the requester can leave a review");
    }

    if (consultation.status !== "completed") {
      throw new ValidationError("Can only review completed consultations");
    }

    const existingReview = await Review.findOne({ consultation_id: consultationId });
    if (existingReview) {
      throw new ValidationError("Review already exists for this consultation");
    }

    // Get reviewer info for notification
    const reviewer = await User.findById(reviewerId).select("username profile.name");

    const review = await Review.create({
      consultation_id: consultationId,
      reviewer_id: reviewerId,
      builder_id: consultation.builder_id,
      rating,
      comment,
    });

    // Send notification to builder
    const reviewerName = reviewer?.profile?.name || reviewer?.username || "Someone";
    await this.notificationService.sendNewReviewNotification(
      consultation.builder_id.toString(),
      reviewerName,
      rating,
      review._id.toString(),
      reviewerId
    );

    return review;
  }
}
