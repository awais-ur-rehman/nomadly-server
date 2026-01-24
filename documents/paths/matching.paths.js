"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchingPaths = void 0;
exports.matchingPaths = {
    "/api/matches/discovery": {
        get: {
            tags: ["Matching"],
            summary: "Get discovery feed",
            description: "Get potential matches based on trajectory intersection",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "intent",
                    in: "query",
                    schema: { type: "string", example: "friends,dating" },
                },
                {
                    name: "rig_type",
                    in: "query",
                    schema: { type: "string", enum: ["sprinter", "skoolie", "suv", "truck_camper"] },
                },
                {
                    name: "verified_only",
                    in: "query",
                    schema: { type: "boolean", example: true },
                },
                {
                    name: "max_distance",
                    in: "query",
                    schema: { type: "number", example: 50000, description: "Maximum distance in meters" },
                },
            ],
            responses: {
                200: {
                    description: "Discovery feed retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/DiscoveryResponse",
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
    "/api/matches/swipe": {
        post: {
            tags: ["Matching"],
            summary: "Swipe on a user",
            description: "Record a swipe action (left, right, or star for caravan request)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SwipeRequest",
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Swipe recorded successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    message: { type: "string", example: "Swipe recorded" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            _id: { type: "string" },
                                            user_id: { type: "string" },
                                            matched_user_id: { type: "string" },
                                            swipe_action: { type: "string", enum: ["left", "right", "star"] },
                                            is_mutual: { type: "boolean" },
                                        },
                                    },
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
    "/api/matches/mutual": {
        get: {
            tags: ["Matching"],
            summary: "Get mutual matches",
            description: "Get all users with mutual matches",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Mutual matches retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/MutualMatch" },
                                    },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/schemas/Error" },
            },
        },
    },
};
//# sourceMappingURL=matching.paths.js.map