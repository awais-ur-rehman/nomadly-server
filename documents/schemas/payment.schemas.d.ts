export declare const paymentSchemas: {
    SubscriptionStatus: {
        type: string;
        properties: {
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            plan: {
                type: string;
                enum: string[];
                example: string;
            };
            expires_at: {
                type: string;
                format: string;
            };
            revenue_cat_id: {
                type: string;
            };
        };
    };
    PaymentStatusResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                $ref: string;
            };
        };
    };
    RevenueCatWebhook: {
        type: string;
        properties: {
            event_type: {
                type: string;
                enum: string[];
            };
            app_user_id: {
                type: string;
            };
            product_id: {
                type: string;
            };
        };
    };
};
//# sourceMappingURL=payment.schemas.d.ts.map