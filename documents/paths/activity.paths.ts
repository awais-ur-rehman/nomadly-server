export const activityPaths = {
  "/api/activities": {
    post: {
      tags: ["Activities"],
      summary: "Create activity beacon",
      description: "Create a new activity beacon (campfire, yoga, etc.)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateActivityRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Activity created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Activity created successfully" },
                  data: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/activities/nearby": {
    get: {
      tags: ["Activities"],
      summary: "Get nearby activities",
      description: "Get activities near a location",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "lat",
          in: "query",
          required: true,
          schema: { type: "number", example: 37.7749 },
        },
        {
          name: "lng",
          in: "query",
          required: true,
          schema: { type: "number", example: -122.4194 },
        },
        {
          name: "max_distance",
          in: "query",
          schema: { type: "number", example: 50000, description: "Maximum distance in meters" },
        },
      ],
      responses: {
        200: {
          description: "Activities retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ActivityResponse",
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/activities/{id}/join": {
    post: {
      tags: ["Activities"],
      summary: "Request to join activity",
      description: "Request to join an activity (requires host approval)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Join request sent successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Join request sent" },
                  data: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/activities/{id}/approve/{userId}": {
    patch: {
      tags: ["Activities"],
      summary: "Approve participant",
      description: "Approve a participant's join request (host only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Participant approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Participant approved" },
                  data: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
        403: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/activities/{id}/reject/{userId}": {
    patch: {
      tags: ["Activities"],
      summary: "Reject participant",
      description: "Reject a participant's join request (host only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Participant rejected successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Participant rejected" },
                  data: { $ref: "#/components/schemas/Activity" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
        403: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};
