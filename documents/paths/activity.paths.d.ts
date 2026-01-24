export declare const activityPaths: {
    "/api/activities": {
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
                                        $ref: string;
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
    "/api/activities/nearby": {
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
                required: boolean;
                schema: {
                    type: string;
                    example: number;
                    description?: undefined;
                };
            } | {
                name: string;
                in: string;
                schema: {
                    type: string;
                    example: number;
                    description: string;
                };
                required?: undefined;
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
                400: {
                    $ref: string;
                };
                401: {
                    $ref: string;
                };
            };
        };
    };
    "/api/activities/{id}/join": {
        post: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                };
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
                                    message: {
                                        type: string;
                                        example: string;
                                    };
                                    data: {
                                        $ref: string;
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
    "/api/activities/{id}/approve/{userId}": {
        patch: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                };
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
                                    message: {
                                        type: string;
                                        example: string;
                                    };
                                    data: {
                                        $ref: string;
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
                403: {
                    $ref: string;
                };
            };
        };
    };
    "/api/activities/{id}/reject/{userId}": {
        patch: {
            tags: string[];
            summary: string;
            description: string;
            security: {
                bearerAuth: never[];
            }[];
            parameters: {
                name: string;
                in: string;
                required: boolean;
                schema: {
                    type: string;
                };
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
                                    message: {
                                        type: string;
                                        example: string;
                                    };
                                    data: {
                                        $ref: string;
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
                403: {
                    $ref: string;
                };
            };
        };
    };
};
//# sourceMappingURL=activity.paths.d.ts.map