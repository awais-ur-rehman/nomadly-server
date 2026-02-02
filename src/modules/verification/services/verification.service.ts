import { User } from "../../users/models/user.model";
import { NotFoundError, ValidationError, ConflictError } from "../../../utils/errors";

const BADGE_MAP: Record<number, string> = {
  0: "none",
  1: "basic",
  2: "trusted",
  3: "verified",
  4: "super_verified",
  5: "nomad_elite",
};

// Minimum vouches needed for community verification
const COMMUNITY_VOUCH_THRESHOLD = 3;

export class VerificationService {
  // ─── LEVEL COMPUTATION ────────────────────────────────────────────

  /**
   * Recompute a user's verification level and badge from their individual statuses.
   * Level 0: Nothing verified
   * Level 1: Email verified
   * Level 2: Email + Phone submitted
   * Level 3: Email + Phone + Photo verified
   * Level 4: Email + Phone + Photo + Community vouched
   * Level 5: Email + Phone + Photo + Community + ID verified (Nomad Elite)
   */
  private computeLevel(user: any): { level: number; badge: string } {
    let level = 0;

    if (user.verification?.email?.status === "verified") level++;
    if (level >= 1 && user.verification?.phone?.status === "verified") level++;
    if (level >= 2 && user.verification?.photo?.status === "verified") level++;
    if (level >= 3 && user.verification?.community?.status === "verified") level++;
    if (level >= 4 && user.verification?.id_document?.status === "verified") level++;

    return { level, badge: BADGE_MAP[level] || "none" };
  }

  private async updateLevel(userId: string) {
    const user = await User.findById(userId);
    if (!user) return;

    const { level, badge } = this.computeLevel(user);
    user.verification.level = level;
    user.verification.badge = badge as any;

    // Sync the legacy nomad_id.verified flag
    user.nomad_id.verified = level >= 3;

    user.markModified("verification");
    await user.save();

    return { level, badge };
  }

  // ─── USER STATUS ──────────────────────────────────────────────────

  async getVerificationStatus(userId: string) {
    const user = await User.findById(userId).select("verification nomad_id");
    if (!user) throw new NotFoundError("User not found");

    return {
      verification: user.verification,
      nomad_id: user.nomad_id,
    };
  }

  // ─── PHONE VERIFICATION ──────────────────────────────────────────
  // Free approach: User submits phone number, admin verifies manually.
  // No SMS OTP (Twilio costs money).

  async submitPhone(userId: string, phoneNumber: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.phone?.status === "verified") {
      throw new ConflictError("Phone is already verified");
    }

    user.phone = phoneNumber;
    user.verification.phone = {
      status: "submitted",
      number: phoneNumber,
    };
    user.markModified("verification");
    await user.save();

    return { status: "submitted", message: "Phone number submitted for verification" };
  }

  // ─── PHOTO VERIFICATION ──────────────────────────────────────────
  // User uploads a selfie (uses existing Cloudinary upload route).
  // Admin reviews and approves/rejects.

  async submitPhotoVerification(userId: string, selfieUrl: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.photo?.status === "verified") {
      throw new ConflictError("Photo is already verified");
    }

    if (user.verification?.photo?.status === "pending") {
      throw new ConflictError("Photo verification already pending review");
    }

    user.verification.photo = {
      status: "pending",
      selfie_url: selfieUrl,
      submitted_at: new Date(),
    };
    user.markModified("verification");
    await user.save();

    return { status: "pending", message: "Selfie submitted for admin review" };
  }

  // ─── ID DOCUMENT VERIFICATION ────────────────────────────────────
  // User uploads an ID document image (uses existing Cloudinary upload route).
  // Admin reviews and approves/rejects.

  async submitIdDocument(userId: string, documentUrl: string, documentType: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.id_document?.status === "verified") {
      throw new ConflictError("ID is already verified");
    }

    if (user.verification?.id_document?.status === "pending") {
      throw new ConflictError("ID verification already pending review");
    }

    user.verification.id_document = {
      status: "pending",
      document_url: documentUrl,
      document_type: documentType,
      submitted_at: new Date(),
    };
    user.markModified("verification");
    await user.save();

    return { status: "pending", message: "ID document submitted for admin review" };
  }

  // ─── COMMUNITY VERIFICATION ──────────────────────────────────────
  // Auto-computed: if user has >= COMMUNITY_VOUCH_THRESHOLD vouches, mark verified.

  async refreshCommunityStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const vouchCount = user.nomad_id?.vouch_count || 0;

    user.verification.community = {
      status: vouchCount >= COMMUNITY_VOUCH_THRESHOLD ? "verified" : "none",
      vouch_count: vouchCount,
      verified_at: vouchCount >= COMMUNITY_VOUCH_THRESHOLD ? new Date() : undefined,
    };
    user.markModified("verification");
    await user.save();

    await this.updateLevel(userId);

    return user.verification.community;
  }

  // ─── ADMIN ACTIONS ────────────────────────────────────────────────

  async adminReviewPhone(
    _adminId: string,
    targetUserId: string,
    action: "approve" | "reject"
  ) {
    const user = await User.findById(targetUserId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.phone?.status !== "submitted") {
      throw new ValidationError("No pending phone verification to review");
    }

    if (action === "approve") {
      user.verification.phone.status = "verified";
      user.verification.phone.verified_at = new Date();
    } else {
      user.verification.phone.status = "none";
      user.verification.phone.number = undefined;
    }

    user.markModified("verification");
    await user.save();
    const result = await this.updateLevel(targetUserId);

    return { action, user_id: targetUserId, new_level: result };
  }

  async adminReviewPhoto(
    _adminId: string,
    targetUserId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) {
    const user = await User.findById(targetUserId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.photo?.status !== "pending") {
      throw new ValidationError("No pending photo verification to review");
    }

    if (action === "approve") {
      user.verification.photo.status = "verified";
      user.verification.photo.verified_at = new Date();
    } else {
      user.verification.photo.status = "rejected";
      user.verification.photo.rejection_reason = rejectionReason || "Photo did not meet requirements";
    }

    user.markModified("verification");
    await user.save();
    const result = await this.updateLevel(targetUserId);

    return { action, user_id: targetUserId, new_level: result };
  }

  async adminReviewIdDocument(
    _adminId: string,
    targetUserId: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) {
    const user = await User.findById(targetUserId);
    if (!user) throw new NotFoundError("User not found");

    if (user.verification?.id_document?.status !== "pending") {
      throw new ValidationError("No pending ID verification to review");
    }

    if (action === "approve") {
      user.verification.id_document.status = "verified";
      user.verification.id_document.verified_at = new Date();
    } else {
      user.verification.id_document.status = "rejected";
      user.verification.id_document.rejection_reason = rejectionReason || "Document did not meet requirements";
    }

    user.markModified("verification");
    await user.save();
    const result = await this.updateLevel(targetUserId);

    return { action, user_id: targetUserId, new_level: result };
  }

  // ─── ADMIN: PENDING REVIEWS ───────────────────────────────────────

  async getPendingVerifications(type?: "phone" | "photo" | "id_document", page = 1, limit = 20) {
    const query: any = {};

    if (type === "phone") {
      query["verification.phone.status"] = "submitted";
    } else if (type === "photo") {
      query["verification.photo.status"] = "pending";
    } else if (type === "id_document") {
      query["verification.id_document.status"] = "pending";
    } else {
      // All pending
      query.$or = [
        { "verification.phone.status": "submitted" },
        { "verification.photo.status": "pending" },
        { "verification.id_document.status": "pending" },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("username profile.name profile.photo_url verification")
        .sort({ "verification.photo.submitted_at": 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total, page, limit };
  }
}
