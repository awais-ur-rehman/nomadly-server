"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatPaths = void 0;
exports.chatPaths = {
    "/api/chat/conversations": {
        get: {
            tags: ["Chat"],
            summary: "Get conversations",
            description: "Get all conversations for the authenticated user",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Conversations retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ConversationsResponse",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/chat/{conversationId}/messages": {
        get: {
            tags: ["Chat"],
            summary: "Get messages",
            description: "Get messages for a conversation",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "conversationId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
                {
                    name: "page",
                    in: "query",
                    schema: { type: "number", example: 1 },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: { type: "number", example: 50 },
                },
            ],
            responses: {
                200: {
                    description: "Messages retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MessagesResponse",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
                404: { $ref: "#/components/schemas/Error" },
            },
        },
        post: {
            tags: ["Chat"],
            summary: "Send message",
            description: "Send a message in a conversation",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "conversationId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SendMessageRequest",
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Message sent successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    message: { type: "string", example: "Message sent" },
                                    data: { $ref: "#/components/schemas/Message" },
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
    "/api/chat/conversation/{userId}": {
        get: {
            tags: ["Chat"],
            summary: "Get or create conversation",
            description: "Get existing conversation or create a new one with a user",
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
                200: {
                    description: "Conversation retrieved or created",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: { $ref: "#/components/schemas/Conversation" },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/chat/{conversationId}/read": {
        patch: {
            tags: ["Chat"],
            summary: "Mark messages as read",
            description: "Mark all messages in a conversation as read",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "conversationId",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                },
            ],
            responses: {
                200: {
                    description: "Messages marked as read",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Success",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
};
//# sourceMappingURL=chat.paths.js.map