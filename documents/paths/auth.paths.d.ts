export declare const authPaths: {
    "/api/auth/register": {
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
                201: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    status: {
                                        type: string;
                                        example: string;
                                    };
                                    message: {
                                        type: string;
                                        example: string;
                                    };
                                    data: {
                                        type: string;
                                        properties: {
                                            userId: {
                                                type: string;
                                            };
                                            email: {
                                                type: string;
                                            };
                                            isActive: {
                                                type: string;
                                                example: boolean;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                400: {
                    $ref: string;
                };
                409: {
                    $ref: string;
                };
            };
        };
    };
    "/api/auth/verify-otp": {
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
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                400: {
                    $ref: string;
                };
            };
        };
    };
    "/api/auth/login": {
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
    "/api/auth/refresh": {
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
                        "application/json": {
                            schema: {
                                type: string;
                                properties: {
                                    status: {
                                        type: string;
                                        example: string;
                                    };
                                    data: {
                                        type: string;
                                        properties: {
                                            token: {
                                                type: string;
                                            };
                                        };
                                    };
                                };
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
    "/api/auth/resend-otp": {
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
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                400: {
                    $ref: string;
                };
            };
        };
    };
};
//# sourceMappingURL=auth.paths.d.ts.map