import { Trip } from "../models/trip.model";
import { NotFoundError, ValidationError } from "../../../utils/errors";

export class TripService {
  async createTrip(creatorId: string, tripData: any): Promise<any> {
    const trip = await Trip.create({
      ...tripData,
      creator_id: creatorId,
      interested_users: [],
      companions: [],
      status: "planning",
    });

    return this.getTripById(trip._id.toString(), creatorId);
  }

  async getTripById(tripId: string, currentUserId?: string): Promise<any> {
    const trip = await Trip.findById(tripId)
      .populate("creator_id", "username profile nomad_id")
      .populate("companions", "username profile nomad_id")
      .populate("interested_users.user_id", "username profile nomad_id");

    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    const tripObj = trip.toObject();

    // Add computed fields
    // creator_id is populated, so it's an object with _id
    const creatorId = (trip.creator_id as any)._id || trip.creator_id;
    const isCreator = creatorId.toString() === currentUserId;
    const myInterest = trip.interested_users.find(
      (i: any) => {
        const userId = i.user_id?._id || i.user_id;
        return userId?.toString() === currentUserId;
      }
    );
    const isCompanion = trip.companions.some(
      (c: any) => {
        const companionId = c._id || c;
        return companionId.toString() === currentUserId;
      }
    );

    return {
      ...tripObj,
      isCreator,
      isCompanion,
      myInterestStatus: myInterest?.status || null,
      pendingCount: trip.interested_users.filter((i: any) => i.status === "pending").length,
    };
  }

  async getMyTrips(userId: string): Promise<any[]> {
    const trips = await Trip.find({ creator_id: userId })
      .populate("creator_id", "username profile nomad_id")
      .populate("companions", "username profile nomad_id")
      .sort({ created_at: -1 });

    return trips.map(trip => {
      const tripObj = trip.toObject();
      return {
        ...tripObj,
        pendingCount: trip.interested_users.filter((i: any) => i.status === "pending").length,
        companionCount: trip.companions.length,
      };
    });
  }

  async getTripsJoined(userId: string): Promise<any[]> {
    const trips = await Trip.find({
      companions: userId,
      status: { $in: ["planning", "active"] }
    })
      .populate("creator_id", "username profile nomad_id")
      .sort({ start_date: 1 });

    return trips;
  }

  async getNearbyTrips(
    location: { lat: number; lng: number },
    maxDistance: number = 100000, // 100km default
    currentUserId?: string
  ): Promise<any[]> {
    // Convert meters to radians for $centerSphere (Earth radius ~6378100 meters)
    const radiusInRadians = maxDistance / 6378100;

    const trips = await Trip.find({
      $or: [
        {
          origin: {
            $geoWithin: {
              $centerSphere: [[location.lng, location.lat], radiusInRadians],
            },
          },
        },
        {
          destination: {
            $geoWithin: {
              $centerSphere: [[location.lng, location.lat], radiusInRadians],
            },
          },
        },
      ],
      status: { $in: ["planning", "active"] },
      visibility: "public",
      looking_for_companions: true,
      start_date: { $gte: new Date() },
    })
      .populate("creator_id", "username profile nomad_id rig")
      .sort({ start_date: 1 })
      .limit(50);

    return trips.map(trip => {
      const tripObj = trip.toObject();
      const myInterest = trip.interested_users.find(
        (i: any) => i.user_id?.toString() === currentUserId
      );

      return {
        ...tripObj,
        myInterestStatus: myInterest?.status || null,
        spotsLeft: trip.max_companions - trip.companions.length,
      };
    });
  }

  async updateTrip(tripId: string, creatorId: string, updates: any): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    if (trip.creator_id.toString() !== creatorId) {
      throw new ValidationError("Only the trip creator can update this trip");
    }

    Object.assign(trip, updates);
    await trip.save();

    return this.getTripById(tripId, creatorId);
  }

  async deleteTrip(tripId: string, creatorId: string): Promise<void> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    if (trip.creator_id.toString() !== creatorId) {
      throw new ValidationError("Only the trip creator can delete this trip");
    }

    await Trip.findByIdAndDelete(tripId);
  }

  async showInterest(tripId: string, userId: string, message: string = ""): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    if (trip.creator_id.toString() === userId) {
      throw new ValidationError("Cannot show interest in your own trip");
    }

    if (trip.companions.some((c: any) => c.toString() === userId)) {
      throw new ValidationError("Already a companion on this trip");
    }

    const existingInterest = trip.interested_users.find(
      (i: any) => i.user_id.toString() === userId
    );

    if (existingInterest) {
      if (existingInterest.status === "pending") {
        throw new ValidationError("Interest already pending");
      }
      if (existingInterest.status === "accepted") {
        throw new ValidationError("Already accepted as companion");
      }
      // If declined, allow re-requesting
      existingInterest.status = "pending";
      existingInterest.message = message;
      existingInterest.created_at = new Date();
    } else {
      trip.interested_users.push({
        user_id: userId as any,
        message,
        status: "pending",
        created_at: new Date(),
      });
    }

    await trip.save();
    return this.getTripById(tripId, userId);
  }

  async acceptInterest(tripId: string, creatorId: string, userId: string): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    if (trip.creator_id.toString() !== creatorId) {
      throw new ValidationError("Only the trip creator can accept interests");
    }

    if (trip.companions.length >= trip.max_companions) {
      throw new ValidationError("Trip is already full");
    }

    const interest = trip.interested_users.find(
      (i: any) => i.user_id.toString() === userId && i.status === "pending"
    );

    if (!interest) {
      throw new ValidationError("No pending interest from this user");
    }

    interest.status = "accepted";
    trip.companions.push(userId as any);

    await trip.save();
    return this.getTripById(tripId, creatorId);
  }

  async declineInterest(tripId: string, creatorId: string, userId: string): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    if (trip.creator_id.toString() !== creatorId) {
      throw new ValidationError("Only the trip creator can decline interests");
    }

    const interest = trip.interested_users.find(
      (i: any) => i.user_id.toString() === userId && i.status === "pending"
    );

    if (!interest) {
      throw new ValidationError("No pending interest from this user");
    }

    interest.status = "declined";
    await trip.save();

    return this.getTripById(tripId, creatorId);
  }

  async cancelInterest(tripId: string, userId: string): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    trip.interested_users = trip.interested_users.filter(
      (i: any) => i.user_id.toString() !== userId
    );

    await trip.save();
    return this.getTripById(tripId, userId);
  }

  async leaveTrip(tripId: string, userId: string): Promise<any> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    trip.companions = trip.companions.filter(
      (c: any) => c.toString() !== userId
    );

    // Also update the interest status
    const interest = trip.interested_users.find(
      (i: any) => i.user_id.toString() === userId
    );
    if (interest) {
      interest.status = "declined";
    }

    await trip.save();
    return this.getTripById(tripId, userId);
  }
}
