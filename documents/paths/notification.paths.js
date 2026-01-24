"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPaths = void 0;
exports.notificationPaths = {
    "/api/notifications/test": {
        post: {
            tags: ["Notifications"],
            summary: "Send test notification",
            description: "Send a test push notification",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["title", "body"],
                            properties: {
                                title: { type: "string", example: "Test Notification" },
                                body: { type: "string", example: "This is a test notification" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Notification sent successfully",
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
//# sourceMappingURL=notification.paths.js.map