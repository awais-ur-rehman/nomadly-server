import { Block } from "../models/block.model";
import { Report } from "../models/report.model";
import { User } from "../../users/models/user.model";
import { Match } from "../../matching/models/match.model";
import { Swipe } from "../../matching/models/swipe.model";
import { NotFoundError, ConflictError, ValidationError } from "../../../utils/errors";

export class SafetyService {
  // ─── BLOCK OPERATIONS ───────────────────────────────────────────────

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new ValidationError("You cannot block yourself");
    }

    const blockedUser = await User.findById(blockedId);
    if (!blockedUser) {
      throw new NotFoundError("User not found");
    }

    // Check if already blocked
    const existing = await Block.findOne({ blocker_id: blockerId, blocked_id: blockedId });
    if (existing) {
      throw new ConflictError("User is already blocked");
    }

    // Create block record
    await Block.create({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    // Clean up: remove any existing match between the two users
    await Match.deleteMany({
      users: { $all: [blockerId, blockedId] },
    });

    // Clean up: remove swipes between the two users so they can't re-match
    await Swipe.deleteMany({
      $or: [
        { actor_id: blockerId, target_id: blockedId },
        { actor_id: blockedId, target_id: blockerId },
      ],
    });

    return { blocked: true, blocked_user_id: blockedId };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const result = await Block.findOneAndDelete({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    if (!result) {
      throw new NotFoundError("Block not found");
    }

    return { unblocked: true, unblocked_user_id: blockedId };
  }

  async getBlockedUsers(userId: string) {
    const blocks = await Block.find({ blocker_id: userId })
      .populate("blocked_id", "username profile.name profile.photo_url")
      .sort({ created_at: -1 });

    return blocks.map((b) => ({
      _id: b._id,
      user: b.blocked_id,
      blocked_at: b.created_at,
    }));
  }

  /**
   * Returns all user IDs that should be excluded from a user's view.
   * This includes users they've blocked AND users who have blocked them.
   */
  async getBlockedUserIds(userId: string): Promise<string[]> {
    const [blockedByMe, blockedMe] = await Promise.all([
      Block.find({ blocker_id: userId }).distinct("blocked_id"),
      Block.find({ blocked_id: userId }).distinct("blocker_id"),
    ]);

    // Combine and deduplicate
    const allBlocked = new Set([
      ...blockedByMe.map(String),
      ...blockedMe.map(String),
    ]);

    return Array.from(allBlocked);
  }

  /**
   * Check if either user has blocked the other.
   */
  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    const block = await Block.findOne({
      $or: [
        { blocker_id: userId1, blocked_id: userId2 },
        { blocker_id: userId2, blocked_id: userId1 },
      ],
    });
    return !!block;
  }

  // ─── REPORT OPERATIONS ──────────────────────────────────────────────

  async reportUser(
    reporterId: string,
    reportedId: string,
    reason: string,
    description?: string
  ) {
    if (reporterId === reportedId) {
      throw new ValidationError("You cannot report yourself");
    }

    const reportedUser = await User.findById(reportedId);
    if (!reportedUser) {
      throw new NotFoundError("User not found");
    }

    // Check for duplicate report with same reason
    const existing = await Report.findOne({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      status: { $in: ["pending", "reviewed"] },
    });
    if (existing) {
      throw new ConflictError("You have already reported this user for this reason");
    }

    const report = await Report.create({
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      description,
    });

    // Auto-block after reporting (safety first for solo woman vanlifers)
    const alreadyBlocked = await Block.findOne({
      blocker_id: reporterId,
      blocked_id: reportedId,
    });
    if (!alreadyBlocked) {
      await Block.create({
        blocker_id: reporterId,
        blocked_id: reportedId,
      });
    }

    return {
      report_id: report._id,
      status: report.status,
      auto_blocked: !alreadyBlocked,
    };
  }

  // ─── ADMIN MODERATION ───────────────────────────────────────────────

  async getReports(status?: string, page: number = 1, limit: number = 20) {
    const query: any = {};
    if (status) query.status = status;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("reporter_id", "username profile.name")
        .populate("reported_id", "username profile.name")
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Report.countDocuments(query),
    ]);

    return { reports, total, page, limit };
  }

  async resolveReport(
    reportId: string,
    adminId: string,
    action: "resolved" | "dismissed",
    adminNotes?: string
  ) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError("Report not found");
    }

    report.status = action;
    report.resolved_by = adminId;
    report.resolved_at = new Date();
    if (adminNotes) report.admin_notes = adminNotes;
    await report.save();

    return report;
  }

  async suspendUser(adminId: string, targetUserId: string) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.is_active = false;
    await user.save();

    // Resolve all pending reports against this user
    await Report.updateMany(
      { reported_id: targetUserId, status: "pending" },
      {
        status: "resolved",
        resolved_by: adminId,
        resolved_at: new Date(),
        admin_notes: "User suspended",
      }
    );

    return { suspended: true, user_id: targetUserId };
  }

  async getReportCountForUser(userId: string): Promise<number> {
    return Report.countDocuments({
      reported_id: userId,
      status: { $in: ["pending", "reviewed"] },
    });
  }
}
