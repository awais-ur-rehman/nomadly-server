import { User } from "../../users/models/user.model";
import { Consultation } from "../models/consultation.model";
import { Review } from "../models/review.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export class MarketplaceService {
  async searchBuilders(filters: any, pagination: { page: number; limit: number }) {
    const query: any = {
      is_builder: true,
      is_active: true,
      "builder_profile.availability_status": "available",
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
  ) {
    const builder = await User.findById(builderId);
    if (!builder || !builder.is_builder) {
      throw new NotFoundError("Builder not found");
    }

    const consultation = await Consultation.create({
      requester_id: requesterId,
      builder_id: builderId,
      specialty,
      status: "pending",
      payment_status: "unpaid",
    });

    return consultation;
  }

  async acceptConsultation(consultationId: string, builderId: string) {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      throw new NotFoundError("Consultation not found");
    }

    if (consultation.builder_id.toString() !== builderId) {
      throw new ValidationError("Only the builder can accept this consultation");
    }

    consultation.status = "accepted";
    await consultation.save();

    return consultation;
  }

  async createReview(
    consultationId: string,
    reviewerId: string,
    rating: number,
    comment?: string
  ) {
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

    const review = await Review.create({
      consultation_id: consultationId,
      reviewer_id: reviewerId,
      builder_id: consultation.builder_id,
      rating,
      comment,
    });

    return review;
  }
}
