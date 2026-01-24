"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchingSchemas = void 0;
exports.matchingSchemas = {
    SwipeRequest: {
        type: "object",
        required: ["matched_user_id", "action"],
        properties: {
            matched_user_id: {
                type: "string",
                example: "507f1f77bcf86cd799439011",
            },
            action: {
                type: "string",
                enum: ["left", "right", "star"],
                example: "right",
            },
        },
    },
    MatchResult: {
        type: "object",
        properties: {
            user: {
                type: "object",
                properties: {
                    id: { type: "string", example: "507f1f77bcf86cd799439011" },
                    profile: { $ref: "#/components/schemas/UserProfile" },
                    rig: { $ref: "#/components/schemas/RigInfo" },
                    nomad_id: {
                        type: "object",
                        properties: {
                            verified: { type: "boolean" },
                            vouch_count: { type: "number" },
                        },
                    },
                },
            },
            intersection: { $ref: "#/components/schemas/GeospatialPoint" },
            distance: { type: "number", example: 150, description: "Distance in kilometers" },
            score: { type: "number", example: 85 },
            commonHobbies: {
                type: "array",
                items: { type: "string" },
                example: ["Hiking", "Solar"],
            },
        },
    },
    DiscoveryResponse: {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            data: {
                type: "array",
                items: { $ref: "#/components/schemas/MatchResult" },
            },
        },
    },
    MutualMatch: {
        type: "object",
        properties: {
            matchId: { type: "string", example: "507f1f77bcf86cd799439011" },
            user: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    profile: { $ref: "#/components/schemas/UserProfile" },
                    rig: { $ref: "#/components/schemas/RigInfo" },
                },
            },
            createdAt: { type: "string", format: "date-time" },
        },
    },
};
//# sourceMappingURL=matching.schemas.js.map