export const chatSchemas = {
  SendMessageRequest: {
    type: "object",
    required: ["message"],
    properties: {
      message: {
        type: "string",
        example: "Hello! How are you?",
      },
      message_type: {
        type: "string",
        enum: ["text", "image", "location"],
        example: "text",
      },
    },
  },
  Message: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      conversation_id: { type: "string" },
      sender_id: {
        type: "object",
        properties: {
          _id: { type: "string" },
          profile: { $ref: "#/components/schemas/UserProfile" },
        },
      },
      message: { type: "string", example: "Hello!" },
      message_type: {
        type: "string",
        enum: ["text", "image", "location"],
        example: "text",
      },
      read_by: {
        type: "array",
        items: { type: "string" },
      },
      timestamp: { type: "string", format: "date-time" },
    },
  },
  Conversation: {
    type: "object",
    properties: {
      _id: { type: "string", example: "507f1f77bcf86cd799439011" },
      participants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string" },
            profile: { $ref: "#/components/schemas/UserProfile" },
          },
        },
      },
      type: {
        type: "string",
        enum: ["direct", "group"],
        example: "direct",
      },
      last_message: { type: "string", example: "Hello!" },
      last_message_time: { type: "string", format: "date-time" },
      created_at: { type: "string", format: "date-time" },
    },
  },
  MessagesResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Message" },
      },
      pagination: { $ref: "#/components/schemas/Pagination" },
    },
  },
  ConversationsResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Conversation" },
      },
    },
  },
};
