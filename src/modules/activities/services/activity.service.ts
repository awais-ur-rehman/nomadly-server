import { Activity } from "../models/activity.model";
import { User } from "../../users/models/user.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export class ActivityService {
  private async populateActivity(activityId: any): Promise<any> {
    return Activity.findById(activityId)
      .populate("host_id", "profile nomad_id username")
      .populate("current_participants", "profile nomad_id username")
      .populate("pending_requests", "profile nomad_id username");
  }

  async createActivity(hostId: string, activityData: any): Promise<any> {
    const activity = await Activity.create({
      ...activityData,
      host_id: hostId,
      current_participants: [],
      pending_requests: [],
      status: "open",
    });

    return this.populateActivity(activity._id);
  }

  async getActivityById(id: string): Promise<any> {
    const activity = await Activity.findById(id)
      .populate("host_id", "profile nomad_id username")
      .populate("current_participants", "profile nomad_id username")
      .populate("pending_requests", "profile nomad_id username");

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }
    return activity;
  }

  async getNearbyActivities(
    location: { lat: number; lng: number },
    maxDistance: number = 50000,
    currentUserId?: string
  ): Promise<any[]> {
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          $maxDistance: maxDistance,
        },
      },
      status: { $in: ["open", "full"] },
      event_time: { $gt: new Date() },
    };

    // Exclude current user's own hosted activities
    if (currentUserId) {
      query.host_id = { $ne: currentUserId };
    }

    const activities = await Activity.find(query)
      .populate("host_id", "profile nomad_id username")
      .sort({ event_time: 1 });

    return activities;
  }

  async requestJoin(activityId: string, userId: string): Promise<any> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.status === "expired" || activity.event_time < new Date()) {
      throw new ValidationError("Activity has expired");
    }

    if (activity.current_participants.includes(userId as any)) {
      throw new ValidationError("Already a participant");
    }

    if (activity.pending_requests.includes(userId as any)) {
      throw new ValidationError("Join request already pending");
    }

    if (activity.verified_only) {
      const user = await User.findById(userId);
      if (!user?.nomad_id.verified) {
        throw new ValidationError("Only verified users can join this activity");
      }
    }

    activity.pending_requests.push(userId as any);
    await activity.save();

    return this.populateActivity(activity._id);
  }

  async approveParticipant(
    activityId: string,
    hostId: string,
    participantId: string
  ): Promise<any> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.host_id.toString() !== hostId) {
      throw new ValidationError("Only the host can approve participants");
    }

    if (activity.current_participants.length >= activity.max_participants) {
      throw new ValidationError("Activity is full");
    }

    if (!activity.pending_requests.includes(participantId as any)) {
      throw new ValidationError("No pending request from this user");
    }

    activity.pending_requests = activity.pending_requests.filter(
      (id) => id.toString() !== participantId
    );
    activity.current_participants.push(participantId as any);

    if (activity.current_participants.length >= activity.max_participants) {
      activity.status = "full";
    }

    await activity.save();

    return this.populateActivity(activity._id);
  }

  async rejectParticipant(
    activityId: string,
    hostId: string,
    participantId: string
  ): Promise<any> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.host_id.toString() !== hostId) {
      throw new ValidationError("Only the host can reject participants");
    }

    activity.pending_requests = activity.pending_requests.filter(
      (id) => id.toString() !== participantId
    );
    await activity.save();

    return this.populateActivity(activity._id);
  }

  async expireActivities() {
    const expired = await Activity.updateMany(
      {
        event_time: { $lt: new Date() },
        status: { $ne: "expired" },
      },
      {
        status: "expired",
      }
    );

    return expired.modifiedCount;
  }

  async getMyHostedActivities(userId: string): Promise<any[]> {
    const activities = await Activity.find({
      host_id: userId,
    })
      .populate("host_id", "profile nomad_id username")
      .populate("current_participants", "profile nomad_id username")
      .populate("pending_requests", "profile nomad_id username")
      .sort({ event_time: -1 });

    return activities;
  }

  async getMyJoinedActivities(userId: string): Promise<any[]> {
    const activities = await Activity.find({
      current_participants: userId,
      host_id: { $ne: userId },
    })
      .populate("host_id", "profile nomad_id username")
      .populate("current_participants", "profile nomad_id username")
      .sort({ event_time: -1 });

    return activities;
  }

  async updateActivity(
    activityId: string,
    hostId: string,
    updateData: any
  ): Promise<any> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.host_id.toString() !== hostId) {
      throw new ValidationError("Only the host can update this activity");
    }

    // Only allow updating certain fields
    const allowedFields = [
      "title",
      "description",
      "event_time",
      "max_participants",
      "verified_only",
    ];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    Object.assign(activity, filteredData);
    await activity.save();

    return this.populateActivity(activityId);
  }

  async deleteActivity(activityId: string, hostId: string): Promise<void> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.host_id.toString() !== hostId) {
      throw new ValidationError("Only the host can delete this activity");
    }

    await Activity.findByIdAndDelete(activityId);
  }

  async leaveActivity(activityId: string, userId: string): Promise<any> {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.host_id.toString() === userId) {
      throw new ValidationError("Host cannot leave their own activity");
    }

    if (!activity.current_participants.includes(userId as any)) {
      throw new ValidationError("You are not a participant of this activity");
    }

    activity.current_participants = activity.current_participants.filter(
      (id) => id.toString() !== userId
    );

    // If activity was full, reopen it
    if (activity.status === "full") {
      activity.status = "open";
    }

    await activity.save();

    return this.populateActivity(activity._id);
  }
}
