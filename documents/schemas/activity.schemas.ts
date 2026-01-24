export const activitySchemas = {
  CreateActivityRequest: {
    type: "object",
    required: ["activity_type", "location", "max_participants", "event_time"],
    properties: {
      activity_type: {
        type: "string",
        example: "campfire",
        description: "Type of activity (campfire, yoga, hiking, etc.)",
      },
      location: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number", example: 37.7749 },
          lng: { type: "number", example: -122.4194 },
        },
      },
      max_participants: {
        type: "number",
        example: 10,
        minimum: 1,
      },
      event_time: {
        type: "string",
        format: "date-time",
        example: "2024-06-15T18:00:00Z",
      },
      description: {
        type: "string",
        example: "Join us for a campfire and stargazing",
      },
      verified_only: {
        type: "boolean",
        example: false,
        description: "Only verified users can join",
      },
    },
  },
  Activity: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      host_id: {
        type: "object",
        properties: {
          _id: { type: "string" },
          profile: { $ref: "#/components/schemas/UserProfile" },
          nomad_id: {
            type: "object",
            properties: {
              verified: { type: "boolean" },
            },
          },
        },
      },
      activity_type: { type: "string", example: "campfire" },
      location: { $ref: "#/components/schemas/GeospatialPoint" },
      max_participants: { type: "number", example: 10 },
      current_participants: {
        type: "array",
        items: { type: "string" },
      },
      pending_requests: {
        type: "array",
        items: { type: "string" },
      },
      event_time: { type: "string", format: "date-time" },
      description: { type: "string" },
      verified_only: { type: "boolean" },
      status: {
        type: "string",
        enum: ["open", "full", "expired"],
        example: "open",
      },
      created_at: { type: "string", format: "date-time" },
    },
  },
  ActivityResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Activity" },
      },
    },
  },
};
