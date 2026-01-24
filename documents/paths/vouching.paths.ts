export const vouchingPaths = {
  "/api/vouch/{userId}": {
    post: {
      tags: ["Vouching"],
      summary: "Vouch for user",
      description: "Vouch for a user (requires previous conversation)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        201: {
          description: "Vouch created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Vouch created successfully" },
                  data: { $ref: "#/components/schemas/Vouch" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
        409: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/vouch/received": {
    get: {
      tags: ["Vouching"],
      summary: "Get received vouches",
      description: "Get all vouches received by the authenticated user",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Vouches retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VouchesResponse",
              },
            },
          },
        },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
};
