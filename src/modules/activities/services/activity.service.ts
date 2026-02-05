import { Activity } from "../models/activity.model";
import { User } from "../../users/models/user.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export class ActivityService {
  async createActivity(hostId: string, activityData: any): Promise<any> {
    const activity = await Activity.create({
      ...activityData,
      host_id: hostId,
      current_participants: [],
      pending_requests: [],
      status: "open",
    });

    return activity;
  }

  async getActivityById(id: string): Promise<any> {
    const activity = await Activity.findById(id)
      .populate("host_id", "profile nomad_id")
      .populate("current_participants", "profile nomad_id")
      .populate("pending_requests", "profile nomad_id");

    if (!activity) {
      throw new NotFoundError("Activity not found");
    }
    return activity;
  }

  async getNearbyActivities(
    location: { lat: number; lng: number },
    maxDistance: number = 50000
  ): Promise<any[]> {
    const activities = await Activity.find({
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
    })
      .populate("host_id", "profile nomad_id")
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

    return activity;
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

    return activity;
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

    return activity;
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
}
