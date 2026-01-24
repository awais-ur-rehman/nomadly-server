"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentPaths = void 0;
exports.paymentPaths = {
    "/api/payments/webhook": {
        post: {
            tags: ["Payments"],
            summary: "RevenueCat webhook",
            description: "Webhook endpoint for RevenueCat payment events. **Public endpoint - no authentication required (called by RevenueCat).**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RevenueCatWebhook",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Webhook processed successfully",
                    content: {
                        "text/plain": {
                            schema: { type: "string", example: "OK" },
                        },
                    },
                },
            },
        },
    },
    "/api/payments/status": {
        get: {
            tags: ["Payments"],
            summary: "Get subscription status",
            description: "Get the authenticated user's subscription status",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Subscription status retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/PaymentStatusResponse",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
};
//# sourceMappingURL=payment.paths.js.map