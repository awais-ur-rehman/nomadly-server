import { Vouch } from "../models/vouch.model";
import { User } from "../../users/models/user.model";
import { Conversation } from "../../chat/models/conversation.model";
import { ConflictError, ValidationError } from "../../../utils/errors";

export class VouchingService {
  async createVouch(voucherId: string, voucheeId: string) {
    if (voucherId === voucheeId) {
      throw new ValidationError("Cannot vouch for yourself");
    }

    const existingVouch = await Vouch.findOne({
      voucher_id: voucherId,
      vouchee_id: voucheeId,
    });

    if (existingVouch) {
      throw new ConflictError("Already vouched for this user");
    }

    const hasConversation = await Conversation.findOne({
      participants: { $all: [voucherId, voucheeId] },
    });

    if (!hasConversation) {
      throw new ValidationError(
        "Must have had a conversation with the user before vouching"
      );
    }

    const vouch = await Vouch.create({
      voucher_id: voucherId,
      vouchee_id: voucheeId,
    });

    await User.findByIdAndUpdate(voucheeId, {
      $inc: { "nomad_id.vouch_count": 1 },
    });

    const vouchee = await User.findById(voucheeId);
    if (vouchee && vouchee.nomad_id.vouch_count >= 3) {
      vouchee.nomad_id.verified = true;
      await vouchee.save();
    }

    return vouch;
  }

  async getReceivedVouches(userId: string) {
    const vouches = await Vouch.find({ vouchee_id: userId })
      .populate("voucher_id", "profile")
      .sort({ created_at: -1 });

    return vouches;
  }
}
