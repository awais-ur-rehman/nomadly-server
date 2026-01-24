export declare const paymentPaths: {
    "/api/payments/webhook": {
        post: {
            tags: string[];
            summary: string;
            description: string;
            security: never[];
            requestBody: {
                required: boolean;
                content: {
                    "application/json": {
                        schema: {
                            $ref: string;
                        };
                    };
                };
            };
            responses: {
                200: {
                    description: string;
                    content: {
                        "text/plain": {
                            schema: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                };
            };
        };
    };
    "/api/payments/status": {
        get: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
            responses: {
                200: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                401: {
                    $ref: string;
                };
            };
        };
    };
};
//# sourceMappingURL=payment.paths.d.ts.map