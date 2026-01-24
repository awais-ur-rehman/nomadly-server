export const userPaths = {
  "/api/users/me": {
    get: {
      tags: ["Users"],
      summary: "Get current user profile",
      description: "Get the authenticated user's profile",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
          },
        },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
    patch: {
      tags: ["Users"],
      summary: "Update user profile",
      description: "Update the authenticated user's profile",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateProfileRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/users/complete-profile": {
    post: {
      tags: ["Users"],
      summary: "Complete user profile",
      description: "Complete the user's profile with additional details (hobbies, rig info, bio, etc.). Basic info (name, email, phone, age, gender) is already collected during registration, so this endpoint focuses on additional profile details.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CompleteProfileRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile completed successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/users/route": {
    patch: {
      tags: ["Users"],
      summary: "Update travel route",
      description: "Update user's travel route with origin, destination, and dates",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateRouteRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Travel route updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/users/search": {
    get: {
      tags: ["Users"],
      summary: "Search users",
      description: "Search users with filters",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "intent",
          in: "query",
          schema: { type: "string", example: "friends,dating" },
          description: "Comma-separated list of intents",
        },
        {
          name: "rig_type",
          in: "query",
          schema: { type: "string", enum: ["sprinter", "skoolie", "suv", "truck_camper"] },
        },
        {
          name: "crew_type",
          in: "query",
          schema: { type: "string", enum: ["solo", "couple", "with_pets"] },
        },
        {
          name: "verified_only",
          in: "query",
          schema: { type: "boolean", example: true },
        },
        {
          name: "page",
          in: "query",
          schema: { type: "number", example: 1 },
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "number", example: 20 },
        },
      ],
      responses: {
        200: {
          description: "Users retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UserResponse" },
                  },
                  pagination: { $ref: "#/components/schemas/Pagination" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/users/toggle-builder": {
    patch: {
      tags: ["Users"],
      summary: "Toggle builder status",
      description: "Toggle user's builder status on/off",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Builder status updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
          },
        },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};
