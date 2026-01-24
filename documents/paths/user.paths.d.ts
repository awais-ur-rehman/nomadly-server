export declare const userPaths: {
    "/api/users/me": {
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
        patch: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
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
                401: {
                    $ref: string;
                };
            };
        };
    };
    "/api/users/complete-profile": {
        post: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
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
                401: {
                    $ref: string;
                };
            };
        };
    };
    "/api/users/route": {
        patch: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
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
                401: {
                    $ref: string;
                };
            };
        };
    };
    "/api/users/search": {
        get: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
            parameters: ({
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: string;
                    enum?: undefined;
                };
                description: string;
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    enum: string[];
                    example?: undefined;
                };
                description?: undefined;
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: boolean;
                    enum?: undefined;
                };
                description?: undefined;
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: number;
                    enum?: undefined;
                };
                description?: undefined;
            })[];
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
                                        items: {
                                            $ref: string;
                                        };
                                    };
                                    pagination: {
                                        $ref: string;
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
    "/api/users/toggle-builder": {
        patch: {
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
//# sourceMappingURL=user.paths.d.ts.map