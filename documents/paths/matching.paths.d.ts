export declare const matchingPaths: {
    "/api/matches/discovery": {
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
                    description?: undefined;
                };
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    enum: string[];
                    example?: undefined;
                    description?: undefined;
                };
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: boolean;
                    enum?: undefined;
                    description?: undefined;
                };
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: number;
                    description: string;
                    enum?: undefined;
                };
            })[];
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
    "/api/matches/swipe": {
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
                                            _id: {
                                                type: string;
                                            };
                                            user_id: {
                                                type: string;
                                            };
                                            matched_user_id: {
                                                type: string;
                                            };
                                            swipe_action: {
                                                type: string;
                                                enum: string[];
                                            };
                                            is_mutual: {
                                                type: string;
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
                401: {
                    $ref: string;
                };
            };
        };
    };
    "/api/matches/mutual": {
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
};
//# sourceMappingURL=matching.paths.d.ts.map