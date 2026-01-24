export const marketplacePaths = {
  "/api/marketplace/builders": {
    get: {
      tags: ["Marketplace"],
      summary: "Search builders",
      description: "Search for builders by specialty and filters",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "specialty",
          in: "query",
          schema: { type: "string", example: "Electrical,Plumbing" },
          description: "Comma-separated list of specialties",
        },
        {
          name: "max_rate",
          in: "query",
          schema: { type: "number", example: 100 },
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
          description: "Builders retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BuilderSearchResponse",
              },
            },
          },
        },
        401: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/marketplace/consult": {
    post: {
      tags: ["Marketplace"],
      summary: "Request consultation",
      description: "Request a consultation with a builder",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ConsultationRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Consultation requested successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Consultation requested" },
                  data: { $ref: "#/components/schemas/Consultation" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/schemas/Error" },
        401: { $ref: "#/components/schemas/Error" },
        404: { $ref: "#/components/schemas/Error" },
      },
    },
  },
  "/api/marketplace/consult/{id}/accept": {
    patch: {
      tags: ["Marketplace"],
      summary: "Accept consultation",
      description: "Accept a consultation request (builder only)",
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
          description: "Consultation accepted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Consultation accepted" },
                  data: { $ref: "#/components/schemas/Consultation" },
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
  "/api/marketplace/review": {
    post: {
      tags: ["Marketplace"],
      summary: "Create review",
      description: "Leave a review for a completed consultation",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ReviewRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Review created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  message: { type: "string", example: "Review created successfully" },
                  data: { $ref: "#/components/schemas/Review" },
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
};
