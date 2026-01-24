export const marketplaceSchemas = {
  ConsultationRequest: {
    type: "object",
    required: ["builder_id", "specialty"],
    properties: {
      builder_id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
      },
      specialty: {
        type: "string",
        example: "Electrical",
      },
    },
  },
  Consultation: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      requester_id: { type: "string" },
      builder_id: { type: "string" },
      specialty: { type: "string", example: "Electrical" },
      status: {
        type: "string",
        enum: ["pending", "accepted", "completed", "cancelled"],
        example: "pending",
      },
      scheduled_time: { type: "string", format: "date-time" },
      payment_status: {
        type: "string",
        enum: ["unpaid", "paid", "refunded"],
        example: "unpaid",
      },
      payment_id: { type: "string" },
      created_at: { type: "string", format: "date-time" },
    },
  },
  ReviewRequest: {
    type: "object",
    required: ["consultation_id", "rating"],
    properties: {
      consultation_id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
      },
      rating: {
        type: "number",
        minimum: 1,
        maximum: 5,
        example: 5,
      },
      comment: {
        type: "string",
        example: "Great service, very professional!",
      },
    },
  },
  Review: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      consultation_id: { type: "string" },
      reviewer_id: { type: "string" },
      builder_id: { type: "string" },
      rating: { type: "number", example: 5 },
      comment: { type: "string" },
      created_at: { type: "string", format: "date-time" },
    },
  },
  BuilderSearchResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string" },
            profile: { $ref: "#/components/schemas/UserProfile" },
            builder_profile: { $ref: "#/components/schemas/BuilderProfile" },
          },
        },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
};
