"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = void 0;
exports.commonSchemas = {
    Error: {
        type: "object",
        properties: {
            status: {
                type: "string",
                example: "error",
            },
            message: {
                type: "string",
                example: "Error message",
            },
            errors: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        field: { type: "string" },
                        message: { type: "string" },
                    },
                },
            },
        },
    },
    Success: {
        type: "object",
        properties: {
            status: {
                type: "string",
                example: "success",
            },
            message: {
                type: "string",
                example: "Operation successful",
            },
            data: {
                type: "object",
            },
        },
    },
    Pagination: {
        type: "object",
        properties: {
            page: { type: "number", example: 1 },
            limit: { type: "number", example: 20 },
            total: { type: "number", example: 100 },
            pages: { type: "number", example: 5 },
        },
    },
    GeospatialPoint: {
        type: "object",
        properties: {
            type: { type: "string", example: "Point" },
            coordinates: {
                type: "array",
                items: { type: "number" },
                example: [-122.4194, 37.7749],
                minItems: 2,
                maxItems: 2,
            },
        },
    },
};
//# sourceMappingURL=common.schemas.js.map