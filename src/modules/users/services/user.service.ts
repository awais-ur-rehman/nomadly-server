import { User } from "../models/user.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";
import { type GeospatialPoint } from "../../../types";

export class UserService {
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password_hash");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateProfile(userId: string, updates: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }
    if (updates.rig) {
      user.rig = { ...user.rig, ...updates.rig };
    }
    if (updates.is_builder !== undefined) {
      user.is_builder = updates.is_builder;
    }
    if (updates.builder_profile) {
      user.builder_profile = { ...user.builder_profile, ...updates.builder_profile };
    }

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async completeProfile(userId: string, profileData: any) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (profileData.profile) {
      user.profile = { ...user.profile, ...profileData.profile };
    }
    if (profileData.rig) {
      user.rig = { ...user.rig, ...profileData.rig };
    }

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async updateTravelRoute(
    userId: string,
    origin: GeospatialPoint,
    destination: GeospatialPoint,
    startDate: Date,
    durationDays: number
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.travel_route = {
      origin,
      destination,
      start_date: startDate,
      duration_days: durationDays,
    };

    await user.save();
    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async searchUsers(filters: any, pagination: { page: number; limit: number }) {
    const query: any = { is_active: true };

    if (filters.intent) {
      query["profile.intent"] = { $in: filters.intent };
    }
    if (filters.rigType) {
      query["rig.type"] = filters.rigType;
    }
    if (filters.crewType) {
      query["rig.crew_type"] = filters.crewType;
    }
    if (filters.verifiedOnly) {
      query["nomad_id.verified"] = true;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const users = await User.find(query)
      .select("-password_hash")
      .skip(skip)
      .limit(pagination.limit)
      .sort({ "nomad_id.vouch_count": -1 });

    const total = await User.countDocuments(query);

    return { users, total };
  }

  async toggleBuilderStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.is_builder = !user.is_builder;
    await user.save();

    const { password_hash, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
