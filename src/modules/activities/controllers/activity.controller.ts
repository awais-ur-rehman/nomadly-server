import { type Request, type Response } from "express";
import { ActivityService } from "../services/activity.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class ActivityController {
  constructor(private activityService: ActivityService) { }

  createActivity = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const {
      activity_type, type,
      location,
      max_participants, maxParticipants,
      event_time, startTime,
      description, title,
      verified_only
    } = req.body;

    const payload = {
      title,
      activity_type: activity_type || type,
      location: {
        type: "Point" as const,
        coordinates: [
          Number(location.lng || location.longitude),
          Number(location.lat || location.latitude)
        ] as [number, number]
      },
      max_participants: max_participants || maxParticipants,
      event_time: event_time || startTime,
      description: description,
      verified_only
    };

    const activity = await this.activityService.createActivity(
      req.user.userId,
      payload
    );
    ApiResponse.success(res, activity, "Activity created successfully", 201);
  });

  getActivity = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const activity = await this.activityService.getActivityById(id);
    ApiResponse.success(res, activity);
  });

  getNearby = asyncHandler(async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const maxDistance = req.query.max_distance
      ? parseInt(req.query.max_distance as string)
      : 50000;

    if (!lat || !lng) {
      throw new Error("Latitude and longitude are required");
    }

    const activities = await this.activityService.getNearbyActivities(
      { lat, lng },
      maxDistance
    );
    ApiResponse.success(res, activities);
  });

  requestJoin = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const activity = await this.activityService.requestJoin(id, req.user.userId);
    ApiResponse.success(res, activity, "Join request sent");
  });

  approveParticipant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id, userId } = req.params;
    const activity = await this.activityService.approveParticipant(
      id,
      req.user.userId,
      userId
    );
    ApiResponse.success(res, activity, "Participant approved");
  });

  rejectParticipant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id, userId } = req.params;
    const activity = await this.activityService.rejectParticipant(
      id,
      req.user.userId,
      userId
    );
    ApiResponse.success(res, activity, "Participant rejected");
  });
}
