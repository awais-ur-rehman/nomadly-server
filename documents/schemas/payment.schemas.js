"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchemas = void 0;
exports.paymentSchemas = {
    SubscriptionStatus: {
        type: "object",
        properties: {
            status: {
                type: "string",
                enum: ["active", "expired", "cancelled"],
                example: "active",
            },
            plan: {
                type: "string",
                enum: ["free", "vantage_pro"],
                example: "vantage_pro",
            },
            expires_at: { type: "string", format: "date-time" },
            revenue_cat_id: { type: "string" },
        },
    },
    PaymentStatusResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            data: { $ref: "#/components/schemas/SubscriptionStatus" },
        },
    },
    RevenueCatWebhook: {
        type: "object",
        properties: {
            event_type: {
                type: "string",
                enum: ["INITIAL_PURCHASE", "RENEWAL", "CANCELLATION", "EXPIRATION"],
            },
            app_user_id: { type: "string" },
            product_id: { type: "string" },
        },
    },
};
//# sourceMappingURL=payment.schemas.js.map