import { type Request, type Response } from "express";
import { TripService } from "../services/trip.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class TripController {
  constructor(private tripService: TripService) {}

  createTrip = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { title, description, origin, destination, start_date, duration_days, looking_for_companions, max_companions, visibility } = req.body;

    const tripData = {
      title,
      description,
      origin: {
        type: "Point" as const,
        coordinates: [origin.lng, origin.lat] as [number, number],
        place_name: origin.place_name,
      },
      destination: {
        type: "Point" as const,
        coordinates: [destination.lng, destination.lat] as [number, number],
        place_name: destination.place_name,
      },
      start_date: new Date(start_date),
      duration_days,
      looking_for_companions: looking_for_companions ?? true,
      max_companions: max_companions ?? 4,
      visibility: visibility ?? "public",
    };

    const trip = await this.tripService.createTrip(req.user.userId, tripData);
    ApiResponse.success(res, trip, "Trip created successfully", 201);
  });

  getTrip = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const trip = await this.tripService.getTripById(id, req.user?.userId);
    ApiResponse.success(res, trip);
  });

  getMyTrips = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const trips = await this.tripService.getMyTrips(req.user.userId);
    ApiResponse.success(res, trips);
  });

  getTripsJoined = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }
    const trips = await this.tripService.getTripsJoined(req.user.userId);
    ApiResponse.success(res, trips);
  });

  getNearbyTrips = asyncHandler(async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const maxDistance = req.query.radius
      ? parseInt(req.query.radius as string) * 1000 // Convert km to meters
      : 100000;

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Latitude and longitude are required");
    }

    const trips = await this.tripService.getNearbyTrips(
      { lat, lng },
      maxDistance,
      req.user?.userId
    );
    ApiResponse.success(res, trips);
  });

  updateTrip = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const updates: any = {};

    // Only allow updating specific fields
    const allowedFields = ['title', 'description', 'start_date', 'duration_days', 'looking_for_companions', 'max_companions', 'status', 'visibility'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle location updates
    if (req.body.origin) {
      updates.origin = {
        type: "Point" as const,
        coordinates: [req.body.origin.lng, req.body.origin.lat] as [number, number],
        place_name: req.body.origin.place_name,
      };
    }
    if (req.body.destination) {
      updates.destination = {
        type: "Point" as const,
        coordinates: [req.body.destination.lng, req.body.destination.lat] as [number, number],
        place_name: req.body.destination.place_name,
      };
    }

    const trip = await this.tripService.updateTrip(id, req.user.userId, updates);
    ApiResponse.success(res, trip, "Trip updated successfully");
  });

  deleteTrip = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    await this.tripService.deleteTrip(id, req.user.userId);
    ApiResponse.success(res, null, "Trip deleted successfully");
  });

  showInterest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const { message } = req.body;

    const trip = await this.tripService.showInterest(id, req.user.userId, message || "");
    ApiResponse.success(res, trip, "Interest shown successfully");
  });

  acceptInterest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id, userId } = req.params;
    const trip = await this.tripService.acceptInterest(id, req.user.userId, userId);
    ApiResponse.success(res, trip, "Interest accepted");
  });

  declineInterest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id, userId } = req.params;
    const trip = await this.tripService.declineInterest(id, req.user.userId, userId);
    ApiResponse.success(res, trip, "Interest declined");
  });

  cancelInterest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const trip = await this.tripService.cancelInterest(id, req.user.userId);
    ApiResponse.success(res, trip, "Interest cancelled");
  });

  leaveTrip = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const { id } = req.params;
    const trip = await this.tripService.leaveTrip(id, req.user.userId);
    ApiResponse.success(res, trip, "Left trip successfully");
  });
}
