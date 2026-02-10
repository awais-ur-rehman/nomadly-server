import { InviteCode, generateInviteCode } from "../models/invite-code.model";
import { User } from "../../users/models/user.model";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../../utils/errors";

const MAX_INVITES_FREE = 3;
const MAX_INVITES_PRO = 10;

export class InviteService {
  /**
   * Generate a new invite code for the authenticated user.
   */
  async generateCode(userId: string, maxUses: number = 1) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Check how many active codes the user already has
    const activeCount = await InviteCode.countDocuments({
      created_by: userId,
      is_active: true,
    });

    const limit =
      user.subscription.plan === "vantage_pro"
        ? MAX_INVITES_PRO
        : MAX_INVITES_FREE;

    if (activeCount >= limit) {
      throw new ForbiddenError(
        `You can only have ${limit} active invite codes. Upgrade to Pro for more.`
      );
    }

    // Generate unique code with retry
    let code: string;
    let attempts = 0;
    do {
      code = generateInviteCode();
      const existing = await InviteCode.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    if (attempts >= 5) {
      throw new Error("Failed to generate unique invite code");
    }

    const inviteCode = await InviteCode.create({
      code,
      created_by: userId,
      max_uses: Math.min(maxUses, 5), // Cap at 5 uses per code
    });

    return {
      code: inviteCode.code,
      max_uses: inviteCode.max_uses,
      expires_at: inviteCode.expires_at,
    };
  }

  /**
   * Validate an invite code during registration.
   * Returns the code document if valid, throws if not.
   */
  async validateCode(code: string) {
    const invite = await InviteCode.findOne({
      code: code.toUpperCase(),
      is_active: true,
    });

    if (!invite) {
      throw new ValidationError("Invalid or expired invite code");
    }

    if (invite.expires_at && invite.expires_at < new Date()) {
      invite.is_active = false;
      await invite.save();
      throw new ValidationError("Invite code has expired");
    }

    if (invite.use_count >= invite.max_uses) {
      invite.is_active = false;
      await invite.save();
      throw new ValidationError("Invite code has reached its usage limit");
    }

    return invite;
  }

  /**
   * Mark an invite code as used by a new user.
   */
  async redeemCode(code: string, newUserId: string) {
    const invite = await this.validateCode(code);

    invite.use_count += 1;
    if (!invite.used_by || !Array.isArray(invite.used_by)) {
      invite.used_by = [newUserId];
    } else {
      (invite.used_by as any).push(newUserId);
    }
    invite.used_at = new Date();

    if (invite.use_count >= invite.max_uses) {
      invite.is_active = false;
    }

    await invite.save();

    // Increment the inviter's invite_count
    await User.findByIdAndUpdate(invite.created_by, {
      $inc: { invite_count: 1 },
    });

    return invite.created_by.toString();
  }

  /**
   * Revert an invite usage (e.g., if user creation fails).
   */
  async decrementUsage(code: string, userId: string) {
    const invite = await InviteCode.findOne({ code });
    if (!invite) return;

    if (invite.use_count > 0) {
      invite.use_count -= 1;
    }

    // Remove the user from used_by array
    if (Array.isArray(invite.used_by)) {
      invite.used_by = invite.used_by.filter(id => id.toString() !== userId.toString());
    }

    // Re-activate if it was deactivated due to max uses
    if (invite.use_count < invite.max_uses && (!invite.expires_at || invite.expires_at > new Date())) {
      invite.is_active = true;
    }

    await invite.save();

    // Decrement the inviter's invite_count
    await User.findByIdAndUpdate(invite.created_by, {
      $inc: { invite_count: -1 },
    });
  }

  /**
   * Get all invite codes created by a user.
   */
  async getMyCodes(userId: string) {
    const codes = await InviteCode.find({ created_by: userId })
      .sort({ created_at: -1 })
      .populate("used_by", "username profile.name profile.photo_url");

    return codes.map((c) => ({
      _id: c._id,
      code: c.code,
      max_uses: c.max_uses,
      use_count: c.use_count,
      used_by: c.used_by,
      is_active: c.is_active,
      expires_at: c.expires_at,
      created_at: c.created_at,
    }));
  }

  /**
   * Deactivate an invite code.
   */
  async revokeCode(userId: string, codeId: string) {
    const invite = await InviteCode.findOne({
      _id: codeId,
      created_by: userId,
    });

    if (!invite) {
      throw new NotFoundError("Invite code not found");
    }

    invite.is_active = false;
    await invite.save();

    return { revoked: true, code: invite.code };
  }

  /**
   * Get the invitation tree for a user (who invited whom).
   */
  async getInviteTree(userId: string) {
    // People I invited
    const invited = await User.find({ invited_by: userId })
      .select("username profile.name profile.photo_url invite_count created_at")
      .sort({ created_at: -1 });

    // Who invited me
    const me = await User.findById(userId).select("invited_by").populate(
      "invited_by",
      "username profile.name profile.photo_url"
    );

    return {
      invited_by: me?.invited_by || null,
      people_invited: invited,
      total_invited: invited.length,
    };
  }
}
